# Arcade implementation

The desktop includes Snake and Breakout. Both games start on a ready screen and require an explicit start action. The Arcade component receives `active`, `sound`, `initialGame`, and `onGameChange` from the desktop.

## Decisions

Model the Domain separates pure game transitions from the React controls and canvas renderer. Simulation state stays in refs. React updates the score and lifecycle controls when those values change. Breakout advances at a fixed 120 steps per second, while Snake uses a bounded movement interval.

Hidden or unfocused games pause and require explicit resumption. Losing a Breakout life also pauses before relaunch. Best scores are separate browser-local records for each game. Storage failures preserve playable sessions. Sound requires an enabled preference and a start gesture.

Canvas input is scoped to the focused playfield. Touch buttons are available on coarse-pointer devices. Breakout pointer coordinates account for a letterboxed playfield.

## Verification

`node --test src/components/Desktop/gameLogic.test.mjs` passed all 11 tests. Coverage includes ready and paused states, Snake reversal, growth, wall and body collision, tail movement, full-board victory, Breakout wall and paddle reflection, brick destruction, scoring, victory, and life loss.

`npx eslint src/components/Desktop/Arcade.tsx src/components/Desktop/gameLogic.ts --format compact` passed.

Browser interaction and real touch-device verification remain part of the parent integration check. These unit tests do not claim visual or device coverage.
