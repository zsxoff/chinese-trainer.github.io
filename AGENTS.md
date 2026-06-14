# Chinese trainer

This is a site for practicing Chinese words through repetition.

## Website functionality

- The site is an analogue of Anki for learning words.
- The site provides a `lesson` select to display words only from the selected lesson.
- Words within a lesson are shuffled on load.
- The website provides a `mode` select to choose what to display: Chinese, pinyin, or Russian translation.
- Clicking the "Show answer" button or tapping the card reveals all content for the current word.
- Arrow buttons and keyboard (← → Space Enter) navigate between words.
- **Q&A mode**: a toggle button (`#quiz-mode`) switches between **Слова** (words) and **Вопрос-Ответ** (questions). In Q&A mode, the lesson and mode selects are hidden (via `visibility: hidden`, preserving layout). Switching back to Слова resets to the first lesson.
- **Theme toggle**: fixed button (top-right) switches light/dark, persisted to localStorage.
- **Accent toggle**: fixed button cycles blue → green → red, persisted to localStorage.

## Technical requirements

- The site uses Pico.css v2 framework
- Words are stored in JSON format
- The site uses YAML only in the build step (Python script)
- `lesson_name` field is pre-populated in source JSON files

## Project structure

- Main file is `index.html`
- CSS files stored in `./css` (`style.css` — base styles, `colors.css` — accent overrides)
- JavaScript files stored in `./js` (`script.js` — all app logic)
- `build.py` — Python script that assembles the final dictionary
- `static/dictionary.json` — compiled word dictionary (loaded by frontend)
- `static/questions.json` — Q&A data (`[{"q": "…", "a": "…"}]`)
- `AGENTS.md` — project knowledge for the agent

## Controls grid

Three-column grid: **Режим** (button) | **Урок** (select) | **Показывать** (select).
The mode button is styled via `#quiz-mode` to visually match the selects (same padding, border, background).
Labels use `display: flex; flex-direction: column; justify-content: end;` so all controls sit at the same vertical level.
Selects inside controls have `margin-bottom: 0` to prevent Pico's default margin from breaking alignment.

## Vocabulary

The source vocabulary is located in the `./dictionary` directory. It consists of separate JSON files for each lesson (e.g. `01.json`, `02.json`, etc.). A special file `additional_family.json` uses `lesson: 1000` and custom `lesson_name: "Семья"`.

The `build.py` script assembles all files from `./dictionary` into a single `static/dictionary.json`, which is loaded by the frontend.

One word contains fields:

- `ch` — Chinese translation
- `pn` — Pinyin translation
- `ru` — Russian translation
- `lesson` — Lesson number (integer)
- `lesson_name` — Human-readable lesson name (e.g., `"Урок 1"`, `"Семья"`)

**Example file contents:**

```json
[
  {"ch": "你", "pn": "nǐ", "ru": "ты", "lesson": 1, "lesson_name": "Урок 1"}
]
```

## JavaScript architecture (`js/script.js`)

- IIFE wrapping all variables and functions.
- `allWords[]` — all words from `static/dictionary.json`.
- `qaItems[]` — all items from `static/questions.json`.
- `lessonWords[]` — currently displayed subset (shuffled words for a lesson, or sequential QA items).
- `currentIndex`, `currentMode` (`"ch"`/`"pn"`/`"ru"`), `currentQuizMode` (`"words"`/`"qa"`), `answerShown`.
- `render()` — splits on `currentQuizMode`:
  - **words**: shows `item[currentMode]` text with optional `lang-ru`/`lang-pn` classes; answer shows ch/pn/ru.
  - **qa**: shows `item.q` with class `qa` on display (font-size `1.8rem`); answer shows `item.a`.
- `showAnswer()` / `prevWord()` / `nextWord()` — navigation, wrapping around.
- `selectLesson(lesson)` — filters `allWords` by lesson, shuffles, resets index.
- `populateLessons()` — builds `lesson` select options from `allWords`, using `lesson_name` for display text, sorted numerically by `lesson`.
- `loadData()` — fetches `static/dictionary.json` and `static/questions.json`.
- Keyboard: ← prev, → next, Space/Enter — show answer. Ignored when focus is on a `<select>`.
- Theme and accent init functions.

## CSS (`css/style.css`)

- `#display` default `font-size: 4rem`, `.lang-ru`/`.lang-pn` `2.5rem`, `.qa` `1.8rem`.
- `#answer` fades in via `@keyframes fadeIn`.
- `#card` uses flex column, centered content, min-height 320px.
- Fixed buttons (`#accent-btn`, `#theme-btn`) top-right.

## Build

To rebuild `static/dictionary.json` after editing source files in `./dictionary`:

```bash
python build.py
```
