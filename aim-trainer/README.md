# PRECISION 🎯

A standalone FPS-style aim trainer built using **HTML, CSS, and vanilla JavaScript**, with no backend or dependencies.

## Easiest way to play

Download **PRECISION-Open-Me.html** and double-click it. It opens in Chrome, Edge or Firefox without installation or hosting.

Alternatively, open `index.html` with `style.css` and `script.js` beside it.

## Six modes

- **Gridshot**: Three targets, fast switching
- **Sixshot**: Six small targets, precision
- **Reflex**: One randomly delayed target, response speed
- **Tracking**: Follow a bouncing target continuously with the crosshair
- **Microshot**: Small targets clustered around the centre
- **Flickshot**: One target, randomly placed across the arena

Select a drill, duration (15/30/60/120 seconds), difficulty, target size, speed and spawn frequency. Press **Start Training** for a three-second countdown.

### Controls

- **Mouse movement**: aim
- **Left mouse button**: shoot (or register a click in Tracking)
- **P**: pause/resume
- **Esc**: exit (if pointer lock is active, the first Esc releases the mouse)
- **Fullscreen**: optional fullscreen game

### Stats and history

Live score, accuracy, hits, misses, CPS, and average target reaction time. Results and personal bests are saved to **localStorage**, along with settings. The performance page shows personal bests, session history and a canvas trend chart.

**Scoring:** Most target hits = 100 points; Sixshot = 150; Microshot = 130; Reflex rewards faster hits. Tracking awards points continuously while the cursor overlaps the target, with accuracy based on overlap time. Scores from different modes, difficulty settings and durations are not directly comparable; personal bests shown in the end-of-session banner compare the same mode and duration.

**Reaction time** measures the time between a target spawning and being clicked, not neurological reaction time. Gridshot and Sixshot have multiple targets on screen and may show longer times. Tracking has no click-based reaction metric.

### Settings

Crosshair colour, shape and size; hit sound, ambient tone, hit effects; optional pointer lock and sensitivity scaling. Pointer-lock sensitivity only affects the game's relative cursor and **cannot** change your mouse hardware DPI. Browsers cannot guarantee identical input latency to native games.

## Privacy and limitations

Data is stored only in the current browser profile. Clearing browser storage removes it. There are no accounts, network requests or leaderboards shared with other players.

The application is intended for desktop mouse use. Touch devices may load the interface but are not the intended gameplay platform.

The current release has been implemented in code but has **not yet been validated by automated browser gameplay tests**. Check gameplay and input on your device before relying on the stats.
