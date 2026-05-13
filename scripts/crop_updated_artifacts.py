#!/usr/bin/env python3
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def parse_args() -> argparse.Namespace:
  parser = argparse.ArgumentParser(
    description="Crop artifact tile from updated screenshot set."
  )
  parser.add_argument(
    "--input-dir",
    type=Path,
    default=Path("new_mythic"),
    help="Directory with source screenshots.",
  )
  parser.add_argument(
    "--output-dir",
    type=Path,
    default=Path("output_mythic"),
    help="Directory for cropped artifact images.",
  )
  parser.add_argument("--left", type=float, default=227.5, help="Left offset in pixels.")
  parser.add_argument("--top", type=float, default=393.0, help="Top offset in pixels.")
  parser.add_argument("--size", type=int, default=130, help="Crop size in pixels.")
  parser.add_argument(
    "--reference-width",
    type=float,
    default=585.0,
    help="Reference screenshot width used for left/size values.",
  )
  parser.add_argument(
    "--reference-height",
    type=float,
    default=1266.0,
    help="Reference screenshot height used for top/size values.",
  )
  return parser.parse_args()


def main() -> None:
  args = parse_args()
  input_dir = args.input_dir
  output_dir = args.output_dir
  output_dir.mkdir(parents=True, exist_ok=True)

  files = sorted(
    [p for p in input_dir.iterdir() if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}]
  )
  if not files:
    raise SystemExit(f"No images found in {input_dir}")

  ok = 0
  skipped = 0
  for src in files:
    with Image.open(src) as img:
      w, h = img.size
      scale_x = w / float(args.reference_width)
      scale_y = h / float(args.reference_height)
      left = int(round(args.left * scale_x))
      top = int(round(args.top * scale_y))
      size = int(round(args.size * ((scale_x + scale_y) / 2.0)))
      right = left + size
      bottom = top + size
      if left < 0 or top < 0 or right > w or bottom > h:
        skipped += 1
        print(f"SKIP {src.name}: crop box ({left},{top},{right},{bottom}) is outside image {w}x{h}")
        continue
      cropped = img.crop((left, top, right, bottom))
      out_name = f"{src.stem}_artifact.png"
      out_path = output_dir / out_name
      cropped.save(out_path)
      ok += 1

  print(f"[done] cropped={ok} skipped={skipped} output={output_dir}")


if __name__ == "__main__":
  main()
