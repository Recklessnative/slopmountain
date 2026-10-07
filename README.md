# The Slop Mountain

A narrated first-person browser game about AI-generated content in learning and development, in the spirit of *The Stanley Parable* and the PS1 *Silent Hill*. Kim, a learning designer, builds courses by hand until a tool arrives that makes one in eleven seconds. Thirty courses later, the notification chime swells and Kim catches a two-second glimpse of what the learners have become. At the top of the mountain she can walk down and talk to people one at a time, climb into the LMS to see how deep it goes, or open the laptop again.

An experiment by Yannick, learning strategist.

## Run it

```sh
npm start        # builds dist/ and serves it at http://localhost:8080
```

The game is plain JavaScript on [three.js r128](https://threejs.org) with no runtime dependencies. It must be served over http; the voice files don't load from `file://`.

## Layout

| Path | What it holds |
| --- | --- |
| `src/index.html`, `src/styles.css` | Page markup and the HUD, desktop and title styles |
| `src/game/*.js` | The game, split by area and joined in file-name order by the build |
| `src/vo-manifest.json` | Which recorded voice file plays for each spoken line |
| `public/vo/` | Recorded narration and character voices (mp3) |
| `public/vendor/` | three.js r128 |
| `tools/build.mjs` | Joins the sources into `dist/game.js` and copies assets into `dist/` |
| `tools/gen_vo.py`, `tools/sweep.py`, `voice/` | Voice pipeline: collect spoken lines, record them with Kokoro TTS |
| `src/game/88-lms.js` | The LMS branch: module rooms as data, attention as a 12:00 clock, Completions, real questions, the Mandatory heist |
| `tests/lms.cjs` | Headless run through the summit fork, the LMS, its two endings and the way back to the summit |
| `tests/playthrough.cjs` | Headless full playthrough with screenshots in `tests/out/` |

The source files share one scope: the build wraps them in a single function, so a name declared in one file is visible in all of them.

## Test

```sh
npm install      # Playwright, for the headless playthrough
npm test
```

## Deploy

Every push to `main` builds the game and publishes it with GitHub Pages (`.github/workflows/pages.yml`). In the repository settings, Pages must have its source set to **GitHub Actions**.

## New voice lines

Spoken lines are pre-recorded. A new or changed line plays through the browser's speech synthesis until it is recorded: add it to a `voice/lines-*.json` file (or run `tools/sweep.py`), run `tools/gen_vo.py` with the Kokoro model files, then copy the new mp3s into `public/vo/` and the manifest into `src/vo-manifest.json`.
