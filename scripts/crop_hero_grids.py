#!/usr/bin/env python3
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path


HERO_ORDER = [
    ("human", "richelle"),
    ("human", "milia"),
    ("human", "odelia"),
    ("human", "calix"),
    ("human", "ken"),
    ("human", "idina"),
    ("human", "olga"),
    ("human", "rakan"),
    ("human", "adora"),
    ("human", "kyle"),
    ("human", "scarlet"),
    ("human", "morra"),
    ("human", "liandra"),
    ("human", "karim"),
    ("horde", "lagou"),
    ("horde", "telfer"),
    ("horde", "naru"),
    ("horde", "sol"),
    ("horde", "paru"),
    ("horde", "kaion"),
    ("horde", "aruru"),
    ("horde", "dolucos"),
    ("horde", "jack"),
    ("horde", "paopao"),
    ("horde", "lupico"),
    ("horde", "bella"),
    ("horde", "nevir"),
    ("elf", "abala"),
    ("elf", "fiona"),
    ("elf", "lulu"),
    ("elf", "aolmond"),
    ("elf", "galan"),
    ("elf", "tania"),
    ("elf", "sander"),
    ("elf", "babu"),
    ("elf", "coco"),
    ("elf", "elara"),
    ("elf", "oneiric"),
    ("elf", "serena"),
    ("elf", "chiron"),
    ("undead", "harfa"),
    ("undead", "void"),
    ("undead", "amanda"),
    ("undead", "zenon"),
    ("undead", "carmen"),
    ("undead", "dextor"),
    ("undead", "ash"),
    ("undead", "fleta"),
    ("undead", "ripper"),
    ("undead", "nox"),
    ("undead", "melantha"),
    ("undead", "muerte"),
    ("undead", "sekhrus"),
    ("undead", "louveti"),
    ("light", "taros"),
    ("light", "solina"),
    ("light", "nuel"),
    ("light", "ulion"),
    ("light", "lena"),
    ("light", "leovalt"),
    ("light", "akmon"),
    ("light", "lumen"),
    ("light", "rael"),
    ("darkness", "zagrako"),
    ("darkness", "bahzam"),
    ("darkness", "lilith"),
    ("darkness", "benzel"),
    ("darkness", "zeke"),
    ("darkness", "nebula"),
    ("darkness", "roze"),
    ("darkness", "dmitri"),
    ("darkness", "vescura"),
]


def image_files(input_dir: Path) -> list[Path]:
    extensions = {".jpg", ".jpeg", ".png", ".webp"}
    return sorted(
        path for path in input_dir.iterdir() if path.suffix.lower() in extensions
    )


def load_hero_order(path: Path | None) -> list[tuple[str, str]]:
    if path is None:
        return HERO_ORDER

    order: list[tuple[str, str]] = []
    for line_number, raw_line in enumerate(path.read_text().splitlines(), start=1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        parts = [part.strip() for part in line.replace("/", ",").split(",")]
        if len(parts) != 2 or not parts[0] or not parts[1]:
            raise SystemExit(
                f"Invalid order line {line_number}: expected race,hero_id"
            )
        order.append((parts[0], parts[1]))

    if not order:
        raise SystemExit(f"Order file is empty: {path}")
    return order


def image_size(path: Path) -> tuple[int, int]:
    result = subprocess.run(
        ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
        check=True,
        capture_output=True,
        text=True,
    )
    width = 0
    height = 0
    for line in result.stdout.splitlines():
        if "pixelWidth:" in line:
            width = int(line.split(":", maxsplit=1)[1].strip())
        if "pixelHeight:" in line:
            height = int(line.split(":", maxsplit=1)[1].strip())
    if width <= 0 or height <= 0:
        raise SystemExit(f"Could not read image size: {path}")
    return width, height


def crop_boxes(width: int, height: int, columns: int, rows: int, gap: int) -> list[tuple[int, int, int, int]]:
    cell_width = (width - gap * (columns - 1)) / columns
    cell_height = (height - gap * (rows - 1)) / rows
    boxes = []

    for row in range(rows):
        for column in range(columns):
            left = round(column * (cell_width + gap))
            top = round(row * (cell_height + gap))
            right = round(left + cell_width)
            bottom = round(top + cell_height)
            boxes.append((left, top, right, bottom))

    return boxes


def crop_image(source: Path, output_path: Path, box: tuple[int, int, int, int]) -> None:
    left, top, right, bottom = box
    width = right - left
    height = bottom - top
    subprocess.run(
        [
            "node",
            "scripts/crop_image_with_jimp.mjs",
            str(source),
            str(output_path),
            str(left),
            str(top),
            str(width),
            str(height),
        ],
        check=True,
        capture_output=True,
        text=True,
    )


def source_stem(index: int, source: Path) -> str:
    return f"{index + 1:02d}_{source.stem}"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input-dir", type=Path, required=True)
    parser.add_argument("--output-root", type=Path, default=Path("public/heroes"))
    parser.add_argument("--gap", type=int, default=16)
    parser.add_argument("--columns", type=int, default=3)
    parser.add_argument("--rows", type=int, default=3)
    parser.add_argument(
        "--order-file",
        type=Path,
        help="Optional text file with one race,hero_id per crop slot after grid-order is applied.",
    )
    parser.add_argument(
        "--grid-order",
        choices=("reverse", "row-major"),
        default="reverse",
        help="reverse maps the next hero to the last grid cell, then moves backward.",
    )
    parser.add_argument(
        "--print-plan",
        action="store_true",
        help="Print source image, grid slot, and target hero without cropping.",
    )
    parser.add_argument(
        "--dump-slots",
        type=Path,
        help="Crop every grid slot into this folder using numbered filenames, without assigning heroes.",
    )
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    hero_order = load_hero_order(args.order_file)
    inputs = image_files(args.input_dir)
    slots_per_image = args.columns * args.rows
    if len(inputs) * slots_per_image < len(hero_order):
        raise SystemExit(
            f"Need at least {len(hero_order)} hero slots, got {len(inputs) * slots_per_image}."
        )

    hero_index = 0
    for source_index, source in enumerate(inputs):
        width, height = image_size(source)
        boxes = crop_boxes(width, height, args.columns, args.rows, args.gap)
        if args.grid_order == "reverse":
            boxes = list(reversed(boxes))

        for slot_index, box in enumerate(boxes, start=1):
            if args.dump_slots is not None:
                output_path = (
                    args.dump_slots
                    / f"{source_stem(source_index, source)}_slot_{slot_index:02d}.png"
                )
                output_path.parent.mkdir(parents=True, exist_ok=True)
                crop_image(source, output_path, box)
                print(f"{source.name} slot={slot_index} -> {output_path}")
                continue

            if hero_index >= len(hero_order):
                break

            race, hero_id = hero_order[hero_index]
            output_path = args.output_root / race / hero_id / "image.png"
            if args.print_plan:
                print(f"{source.name} slot={slot_index} -> {race}/{hero_id}")
                hero_index += 1
                continue

            if output_path.exists() and not args.overwrite:
                raise SystemExit(f"Refusing to overwrite existing file: {output_path}")

            output_path.parent.mkdir(parents=True, exist_ok=True)
            crop_image(source, output_path, box)
            print(f"{source.name} -> {output_path}")
            hero_index += 1

    print(f"Cropped {hero_index} heroes.")


if __name__ == "__main__":
    main()
