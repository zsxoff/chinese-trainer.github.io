#!/usr/bin/env python3

import json
import pathlib

from build_lessons import build_lessons


def main():
    files = pathlib.Path("dictionary").rglob("*.json")

    dictionary: list[dict[str, str | int]] = []

    for file in sorted(files):
        with file.open("r") as readfile:
            data: list[dict[str, str | int]] = json.load(readfile)
            dictionary.extend(data)

    with open("static/dictionary.json", "w") as writefile:
        json.dump(dictionary, writefile, ensure_ascii=False, indent=2)
        writefile.write("\n")

    build_lessons()


if __name__ == "__main__":
    main()
