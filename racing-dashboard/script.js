'use strict';

// All physics use seconds and MPH. No timers drive the simulation.
const state = { engine: false, mode: 'P', gear: 1, speed: 0, rpm: 0,
  distance: 0, topSpeed: 0, shiftCooldown: 0, muted: true };
const limits = { speed: 200, rpm: 8000, idle: 850, redline: 7000 };
const ratios = [0, 190, 125, 87, 65, 49, 36]; // RPM per MPH in each gear
const driveForce = [0, 23, 18, 14, 11, 8, 6.5];
const keys = new Set();
const pointers = { throttle: new Set(), brake: new Set() };
const el = id => document.getElementById(id);
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
let audio = null;
let previousTime = null;

// Build vector instruments once; animate only their needles and progress rings.
const svgNS = 'http://www.w3.org/2000/svg';
function svgElement(tag, attributes, parent, content) {
  const element = document.createElementNS(svgNS, tag);
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
  if (content !== undefined) element.textContent = content;
  parent.append(element);
  return element;
}
function point(cx, cy, radius, angle) {
  const radians = angle * Math.PI / 180;
  return { x: cx + Math.sin(radians) * radius, y: cy - Math.cos(radians) * radius };
}
function arc(cx, cy, radius, start, end) {
  const a = point(cx, cy, radius, start), b = point(cx, cy, radius, end);
  return `M ${a.x} ${a.y} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${b.x} ${b.y}`;
}
function buildDial(id, cx, cy, radius, max, step, start, end, redline) {
  const svg = el(id);
  svgElement('path', { d: arc(cx, cy, radius, start, end), fill: 'none', stroke: '#292c33', 'stroke-width': 5 }, svg);
  svgElement('path', { d: arc(cx, cy, radius - 13, start, end), fill: 'none', stroke: '#25282f', 'stroke-width': 1 }, svg);
  if (redline) svgElement('path', { d: arc(cx, cy, radius, start + (end-start)*redline/max, end), fill: 'none', stroke: '#ff3a42', 'stroke-width': 5 }, svg);
  const progress = svgElement('path', { d: arc(cx, cy, radius, start, end), fill: 'none', stroke: '#ff3a42', 'stroke-width': 3, pathLength: 100, 'stroke-dasharray': '0 100', opacity: .85 }, svg);
  for (let value = 0; value <= max; value += step / 5) {
    const angle = start + value / max * (end - start);
    const major = Math.round(value / (step / 5)) % 5 === 0;
    const outer = point(cx, cy, radius - 19, angle), inner = point(cx, cy, radius - (major ? 31 : 25), angle);
    svgElement('line', { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y, stroke: redline && value >= redline ? '#ff5960' : major ? '#9a9faa' : '#444952', 'stroke-width': major ? 2 : 1 }, svg);
    if (major) {
      const label = point(cx, cy, radius - 48, angle);
      svgElement('text', { x: label.x, y: label.y + 4, fill: redline && value >= redline ? '#ff5960' : '#a7adb8', 'text-anchor': 'middle', 'font-size': id === 'rpm-dial' ? 12 : 11 }, svg, redline ? value / 1000 : value);
    }
  }
  // Short perimeter needles leave the digital readouts unobstructed.
  const needle = svgElement('g', { class: 'needle' }, svg);
  svgElement('path', { d: `M ${cx-3} ${cy-radius+11} L ${cx} ${cy-radius+52} L ${cx+3} ${cy-radius+11} Z`, fill: '#ff444c' }, needle);
  return { update(value) {
    const fraction = clamp(value / max, 0, 1);
    needle.setAttribute('transform', `rotate(${start + fraction*(end-start)} ${cx} ${cy})`);
    progress.setAttribute('stroke-dasharray', `${fraction*100} 100`);
  } };
}
const rpmDial = buildDial('rpm-dial', 180, 180, 157, 8000, 1000, -130, 130, 7000);
const speedDial = buildDial('speed-dial', 240, 245, 214, 200, 20, -110, 110, 0);
const lights = Array.from({ length: 10 }, (_, index) => {
  const light = document.createElement('span');
  light.className = 'shift-light';
  light.style.setProperty('--light', index < 5 ? '#89dfb0' : index < 8 ? '#f9c369' : '#ff3a42');
  el('shift-lights').append(light);
  return light;
});

function message(text) { el('message').textContent = text; }
function setMode(mode) {
  if (mode === 'P' && state.speed > 0.5) {
    message('Park is locked while moving. Brake to a complete stop first.');
    return false;
  }
  if (mode === 'D' && !state.engine) {
    message('Start the engine before selecting Drive.');
    return false;
  }
  state.mode = mode;
  if (mode === 'P') state.speed = 0;
  if (mode === 'D') {
    // Match a safe gear to road speed when re-engaging from Neutral.
    state.gear = 1;
    while (state.gear < 6 && state.speed * ratios[state.gear] > 5800) state.gear++;
    state.shiftCooldown = .25;
  }
  message(mode === 'P' ? 'Park engaged. Hold W or ↑ to automatically select Drive.' : mode === 'N' ? 'Neutral engaged. Select D to reconnect the transmission; throttle is disabled.' : 'Drive engaged. Hold W or ↑ to accelerate. Hold S or ↓ to brake.');
  render();
  return true;
}
function prepareThrottle() {
  if (!state.engine) message('Ignition off. Start the engine before accelerating.');
  else if (state.mode === 'P') setMode('D');
  else if (state.mode === 'N') message('Neutral prevents acceleration. Select D to engage Drive.');
}
function toggleEngine() {
  state.engine = !state.engine;
  state.shiftCooldown = 0;
  if (!state.engine) {
    clearInputs();
    message(state.speed > .5 ? 'Engine off. Vehicle is coasting; brakes remain available.' : 'Engine off. Start the engine to drive again.');
  } else message(state.mode === 'N' ? 'Engine running in Neutral. Select D to drive.' : 'Engine running. Hold W or ↑ to accelerate, or select D.');
  if (!state.muted) ensureAudio();
  render();
}
function throttlePressed() { return keys.has('w') || keys.has('arrowup') || pointers.throttle.size > 0; }
function brakePressed() { return keys.has('s') || keys.has('arrowdown') || pointers.brake.size > 0; }
function clearInputs() { keys.clear(); pointers.throttle.clear(); pointers.brake.clear(); }

function simulate(dt) {
  const brake = brakePressed();
  const throttle = throttlePressed() && !brake && state.engine && state.mode === 'D';
  state.shiftCooldown = Math.max(0, state.shiftCooldown - dt);
  if (state.mode === 'P') state.speed = 0;
  else {
    const roadDrag = state.speed > 0 ? .35 + .00011 * state.speed ** 2 : 0;
    const engineBraking = state.engine && state.mode === 'D' && !throttle && state.speed > 0 ? .55 + .012 * state.speed : 0;
    const torqueFade = clamp((limits.rpm - state.speed * ratios[state.gear]) / 1600, 0, 1);
    const acceleration = throttle ? driveForce[state.gear] * torqueFade * (state.shiftCooldown > .22 ? .28 : 1) : 0;
    state.speed = clamp(state.speed + (acceleration - roadDrag - engineBraking - (brake ? 34 : 0)) * dt, 0, limits.speed);
  }
  if (state.engine && state.mode === 'D' && !state.shiftCooldown) {
    const coupledRPM = state.speed * ratios[state.gear];
    if (state.gear < 6 && coupledRPM > 7050) { state.gear++; state.shiftCooldown = .42; }
    else if (state.gear > 1 && coupledRPM < (throttle ? 2800 : 1900) && state.speed * ratios[state.gear-1] < 6200) { state.gear--; state.shiftCooldown = .32; }
  }
  const targetRPM = !state.engine ? 0 : state.mode === 'D' ? clamp(Math.max(limits.idle, state.speed * ratios[state.gear] + (throttle && state.speed < 12 ? 900 * (1-state.speed/12) : 0)), limits.idle, limits.rpm) : limits.idle;
  state.rpm = clamp(state.rpm + (targetRPM - state.rpm) * (1-Math.exp(-dt*10)), 0, limits.rpm);
  if (!state.engine && state.rpm < 1) state.rpm = 0;
  state.distance += state.speed * dt / 3600;
  state.topSpeed = Math.max(state.topSpeed, state.speed);
  updateAudio(throttle);
}

function render() {
  const throttle = throttlePressed() && state.engine && state.mode === 'D' && !brakePressed();
  el('speed-value').textContent = Math.round(state.speed);
  el('rpm-value').textContent = Math.round(state.rpm / 10) * 10;
  el('gear-value').textContent = state.mode === 'D' ? state.gear : state.mode;
  el('drive-label').textContent = state.mode === 'D' ? 'AUTO' : state.mode === 'P' ? 'PARK' : 'NEUTRAL';
  el('engine-status').textContent = state.engine ? 'ENGINE RUNNING' : 'ENGINE OFF';
  el('engine-status').classList.toggle('running', state.engine);
  el('engine-button').setAttribute('aria-pressed', state.engine);
  el('engine-button-label').textContent = state.engine ? 'STOP ENGINE' : 'START ENGINE';
  el('powertrain').textContent = state.engine ? throttle ? 'FULL LOAD' : 'ONLINE' : 'STANDBY';
  el('motion-status').textContent = brakePressed() ? 'BRAKING' : throttle ? 'ACCELERATING' : state.speed > .5 ? 'COASTING' : state.engine ? 'AWAITING THROTTLE' : 'READY WHEN YOU ARE';
  const load = !state.engine ? 0 : throttle ? 100 : 8;
  el('load-bar').style.width = `${load}%`;
  el('load-value').textContent = `${load}%`;
  el('distance-value').textContent = state.distance.toFixed(2);
  el('top-speed').textContent = Math.round(state.topSpeed);
  el('accelerator').classList.toggle('active', throttlePressed());
  el('brake').classList.toggle('active', brakePressed());
  document.querySelectorAll('[data-mode]').forEach(button => {
    const selected = button.dataset.mode === state.mode;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', selected);
  });
  document.querySelectorAll('.mini-bars i').forEach((bar, i) => bar.classList.toggle('active', i < load / 10));
  lights.forEach((light, i) => light.classList.toggle('lit', state.engine && state.rpm >= 4500 + i * 275));
  rpmDial.update(state.rpm);
  speedDial.update(state.speed);
}

// Audio is synthesized locally and created only by an explicit user gesture.
function ensureAudio() {
  try {
    if (!audio) {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!Context) throw new Error('Web Audio unavailable');
      const context = new Context();
      const filter = context.createBiquadFilter();
      filter.type = 'lowpass'; filter.frequency.value = 500;
      const gain = context.createGain(); gain.gain.value = 0;
      filter.connect(gain); gain.connect(context.destination);
      const oscillators = [1, 2.01, .5].map((multiplier, index) => {
        const oscillator = context.createOscillator();
        oscillator.type = index === 2 ? 'sine' : 'sawtooth';
        oscillator.frequency.value = 40 * multiplier;
        oscillator.connect(filter); oscillator.start();
        return { oscillator, multiplier };
      });
      audio = { context, filter, gain, oscillators };
    }
    audio.context.resume().catch(audioUnavailable);
  } catch { audioUnavailable(); }
}
function audioUnavailable() {
  state.muted = true;
  updateMuteButton();
  message('Engine audio is unavailable in this browser. Driving controls remain active.');
}
function updateMuteButton() {
  el('mute').setAttribute('aria-pressed', state.muted);
  el('mute').innerHTML = `${state.muted ? 'SOUND OFF' : 'SOUND ON'} <span>◖))</span>`;
}
function updateAudio(throttle) {
  if (!audio) return;
  const now = audio.context.currentTime;
  const audible = state.engine && !state.muted && !document.hidden;
  audio.gain.gain.setTargetAtTime(audible ? (throttle ? .035 : .018) : 0, now, .06);
  audio.filter.frequency.setTargetAtTime(180 + state.rpm * .12, now, .08);
  audio.oscillators.forEach(({ oscillator, multiplier }) => oscillator.frequency.setTargetAtTime(Math.max(20, state.rpm / 30) * multiplier, now, .05));
}

el('engine-button').addEventListener('click', toggleEngine);
el('mute').addEventListener('click', () => { state.muted = !state.muted; updateMuteButton(); if (!state.muted) ensureAudio(); });
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  if (!['w', 's', 'arrowup', 'arrowdown'].includes(key) || event.ctrlKey || event.metaKey || event.altKey) return;
  event.preventDefault();
  if (!keys.has(key) && (key === 'w' || key === 'arrowup')) prepareThrottle();
  keys.add(key);
});
window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
function bindPedal(id, input) {
  const button = el(id);
  button.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    if (input === 'throttle') prepareThrottle();
    pointers[input].add(event.pointerId);
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => button.addEventListener(type, event => pointers[input].delete(event.pointerId)));
  // Space and Enter also operate focused pedals for keyboard accessibility.
  button.addEventListener('keydown', event => {
    if (![' ', 'Enter'].includes(event.key)) return;
    event.preventDefault();
    if (input === 'throttle' && !pointers[input].has('keyboard')) prepareThrottle();
    pointers[input].add('keyboard');
  });
  button.addEventListener('keyup', event => { if ([' ', 'Enter'].includes(event.key)) pointers[input].delete('keyboard'); });
  button.addEventListener('blur', () => pointers[input].delete('keyboard'));
}
bindPedal('accelerator', 'throttle');
bindPedal('brake', 'brake');
window.addEventListener('blur', clearInputs);
document.addEventListener('visibilitychange', () => {
  clearInputs(); previousTime = null;
  if (document.hidden && audio) audio.gain.gain.setTargetAtTime(0, audio.context.currentTime, .03);
});
function frame(time) {
  // Bound catch-up after interruptions and substep physics for consistent shifts.
  let remaining = previousTime === null || document.hidden ? 0 : clamp((time-previousTime)/1000, 0, .1);
  previousTime = time;
  while (remaining > 0) { const dt = Math.min(remaining, 1/120); simulate(dt); remaining -= dt; }
  render();
  requestAnimationFrame(frame);
}
render();
requestAnimationFrame(frame);
