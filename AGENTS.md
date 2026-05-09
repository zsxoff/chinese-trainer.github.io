# Chinese trainer

This is a site for practicing Chinese words through repetition.

## Website functionality

- The site is an analogue of Anki for learning words.
- The site should provide a `lesson` selection button to display translations of words only from the selected lesson.
- The site should shuffle the translations of words within the selected lesson.
- The website should provide the option to choose what to display on the screen - Chinese, pinyin, or Russian translation.
- By clicking on the "Show answer" button, the site should show all the content for this word (the Chinese, pinyin, Russian translation).
- The site should have arrows to move to the next word.

## Technical requirements

- The site uses Pico.css framework

## Vocabulary

The vocabulary for the trainer is located in the `./static` directory. It consists of YAML files containing sets of words, divided into lessons.

One word contains fields:

- `ch` - Chinese translation
- `pn` - Pinyin translation
- `ru` - Russian translation
- `lesson` - Lesson number

**Example file contents**:

```yaml
- ch: 小
  pn: xiǎo
  ru: маленький
  lesson: 9
```
