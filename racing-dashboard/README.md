# APEX — Racing Dashboard Simulator

A standalone supercar instrument cluster with live driving physics. No installation, network connection, libraries, or build step is required.

## Run

Open `index.html` directly in a modern browser (Chrome, Edge, Firefox, or Safari). Keep `style.css` and `script.js` in the same folder.

## Drive

- Click **Start Engine** to turn on the ignition.
- Hold **W / Arrow Up** or the on-screen **Accelerate** pedal to accelerate. From Park, this explicitly engages Drive automatically.
- Hold **S / Arrow Down** or the **Brake** pedal to slow down. Braking takes priority over acceleration.
- Release the accelerator to coast with drag and engine braking.
- Select **P** for Park, **N** for Neutral, or **D** for automatic Drive. Park is blocked above 0.5 MPH. Neutral disables propulsion; select D explicitly to resume driving. Drive chooses a safe gear when re-engaged while moving.
- Click **Stop Engine** to shut down. A moving vehicle continues coasting, with working brakes.
- Click **Sound Off** to enable optional synthesized engine audio; click again to mute. Audio is off by default and only initializes after interaction.
- The on-screen pedals support mouse, touch, and Space / Enter while focused. Inputs clear when the window loses focus or the page is hidden.

## Instruments and simulation

Speed is limited to 0–200 MPH; RPM to 0–8,000, with a 7,000 RPM redline. The six-speed automatic gearbox shifts according to road speed and engine RPM, including a brief torque interruption. Progressive shift lights activate between 4,500 and 6,975 RPM. The gauges, digital readouts, gear, load, distance, top speed, and engine status share one simulation state.

Physics use elapsed time and small integration steps inside `requestAnimationFrame`, with smooth RPM response and vector needle movement. The model includes gear-dependent acceleration, high-RPM torque reduction, aerodynamic drag, engine braking, and service brakes. This is an illustrative simulator rather than a model of a particular real vehicle. The session pauses in a hidden tab; distance and top speed reset on reload.

## Files

- `index.html`: semantic dashboard layout and accessible controls.
- `style.css`: responsive instrument cluster, typography, lighting, and controls.
- `script.js`: vector gauges, driving simulation, interactions, and Web Audio synthesis.

All graphics and sounds are generated locally. No external assets or dependencies are loaded.
