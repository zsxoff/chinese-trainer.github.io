import html
from pathlib import Path
from string import Template

import frontmatter
from markdown import Markdown

ROOT = Path(__file__).resolve().parent
SOURCE_DIR = ROOT / "theory"
OUTPUT_DIR = ROOT / "lessons"
TEMPLATE_PATH = ROOT / "templates" / "theory.html"


def convert_lesson(path: Path) -> dict[str, str | int]:
    lesson = frontmatter.loads(path.read_text(encoding="utf-8"))
    if "title" not in lesson:
        raise ValueError(f"Missing title in {path}")

    markdown = Markdown(
        extensions=["extra", "toc", "sane_lists"],
        extension_configs={"toc": {"permalink": True, "toc_depth": "2-3"}},
    )
    content = markdown.convert(lesson.content)

    return {
        "title": str(lesson["title"]),
        "summary": str(lesson.get("summary", "")),
        "order": int(lesson.get("order", 0)),
        "slug": path.stem,
        "content": content,
        "toc": markdown.toc,
    }


def render_page(template: Template, title: str, content: str) -> str:
    return template.substitute(title=html.escape(title), content=content)


def build_lessons() -> None:
    template = Template(TEMPLATE_PATH.read_text(encoding="utf-8"))
    lessons = [convert_lesson(path) for path in sorted(SOURCE_DIR.glob("*.md"))]
    lessons.sort(key=lambda lesson: (lesson["order"], lesson["title"]))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    cards = []
    for lesson in lessons:
        title = html.escape(str(lesson["title"]))
        summary = html.escape(str(lesson["summary"]))
        toc = ""
        if lesson["toc"]:
            toc = (
                '<nav class="lesson-toc" aria-label="Содержание урока">'
                "<strong>Содержание</strong>"
                + str(lesson["toc"])
                + "</nav>"
            )
        content = (
            '<nav class="theory-breadcrumb" aria-label="Навигация"><a href="index.html">← Все уроки</a></nav>'
            f"<h1>{title}</h1>"
            + toc
            + '<div class="lesson-content">'
            + str(lesson["content"])
            + "</div>"
            + '<nav class="lesson-back"><a href="index.html">← К оглавлению</a></nav>'
        )
        page = render_page(template, f"{lesson['title']} — Уроки", content)
        (OUTPUT_DIR / f"{lesson['slug']}.html").write_text(page, encoding="utf-8")

        cards.append(
            '<article class="lesson-card">'
            f'<h2><a href="{lesson["slug"]}.html">{title}</a></h2>'
            f"<p>{summary}</p>"
            "</article>"
        )

    lesson_list = "".join(cards) or "<p>Материалы скоро появятся.</p>"
    index_content = (
        "<h1>Уроки</h1>"
        '<p class="theory-intro">Краткая теория китайского языка с примерами и переводами.</p>'
        '<div class="lesson-list">'
        + lesson_list
        + "</div>"
    )
    index_page = render_page(template, "Уроки — Тренажёр китайского языка", index_content)
    (OUTPUT_DIR / "index.html").write_text(index_page, encoding="utf-8")
    print(f"Built {len(lessons)} lesson(s)")


if __name__ == "__main__":
    build_lessons()
