# SMART Shooter Games

An experimental web demo inspired by two classroom games originally created in Adobe Animate with ActionScript 3.

This project carries the **gameplay concept** into a simple HTML, CSS, and JavaScript application. It is not intended to reproduce the artwork or presentation of the original games.

## Demo status

The current version is suitable as a first presentational demo. It demonstrates:

- two complete, playable game concepts;
- a shared visual style and reusable game engine;
- mouse, touch, and classroom-projector use;
- lives, countdown timing, sound feedback, progress tracking, and result screens;
- responsive scaling and fullscreen presentation;
- editable question and word data without a build process.

It should still be treated as a prototype rather than a finished commercial release.

## Included games

### Number Shooter

The player reads a number word and shoots the balloon displaying the matching numeral.

- Nine rounds are selected randomly from the numbers 1–20.
- Eight balloons move around the play area.
- A wrong balloon costs one life and is replaced.
- The balloons gradually become faster as time runs out.

### Letter Shooter

The player looks at a picture and a word with one or two missing letters, then shoots the correct floating letters.

- Twelve picture-word rounds are included.
- Longer words can contain two missing letters.
- A wrong letter costs one life.
- Shooting the same correct letter twice also costs one life.

## Running the demo

No installation, framework, package manager, or build step is required.

1. Keep all five project files in the same folder.
2. Open `index.html` in a modern web browser.
3. Choose **Number Shooter** or **Letter Shooter**.

The games can also be served from any ordinary static web server.

The demo requests Fredoka and Lilita One from Google Fonts. If no internet connection is available, the games continue with their built-in fallback fonts.

## Controls

- **Click or tap:** choose a round and shoot a target.
- **F:** enter or leave fullscreen mode.
- **M:** mute or unmute game sounds.
- **Esc:** close the instructions or return to the game menu.
- **Home icon:** return to the main game-selection page.

Portrait phones display a prompt asking the player to rotate the device sideways.

## Project files

- `index.html` — presentation page and game selector.
- `number-shooter.html` — Number Shooter content, artwork, and round logic.
- `letter-shooter.html` — Letter Shooter content, artwork, and round logic.
- `shared.css` — shared 1280 × 720 game-stage styling and responsive presentation.
- `shared.js` — shared game engine, audio, timer, lives, progress, effects, and controls.

## Editing the learning content

The main classroom content is intentionally kept near the top of each game file under **Teacher settings**.

In `number-shooter.html`, teachers or developers can edit:

- the available number words;
- the maximum numeral shown on balloons;
- the number of rounds;
- the number of balloons on screen.

In `letter-shooter.html`, they can edit:

- the word list;
- the picture emoji and background colours for each word;
- the number of additional wrong letters.

The shared engine also supports configurable lives and round time if later versions need different difficulty levels.

## Design direction

The old Adobe Animate games are references for the activity concept only. Future versions may freely change the artwork, characters, motion, interface, and visual theme while preserving the child-friendly shooting-and-matching idea.

## Credits

Created by **Ehsan Ashour Zadeh** for **SMART English**.
@2026
