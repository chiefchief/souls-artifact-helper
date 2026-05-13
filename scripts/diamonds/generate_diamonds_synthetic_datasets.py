#!/usr/bin/env python3
from __future__ import annotations

import argparse
import importlib.util
import random
from pathlib import Path

from PIL import Image


def _load_artifact_module():
    mod_path = Path(__file__).resolve().parents[1] / "artifact" / "generate_artifacts_synthetic_datasets.py"
    spec = importlib.util.spec_from_file_location("artifact_gen", mod_path)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Cannot load artifact generator module: {mod_path}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def _resolve_diamond_ref_paths() -> dict[int, list[Path]]:
    base = Path("assets/diamond_refs")
    all_pngs = sorted(base.glob("*.png"))
    by_class: dict[int, list[Path]] = {}

    def picks(tokens: tuple[str, ...]) -> list[Path]:
        matched: list[Path] = []
        for p in all_pngs:
            n = p.name.lower()
            if all(t in n for t in tokens):
                matched.append(p)
        return matched

    one = picks(("one",))
    two = picks(("two",))
    three = picks(("three",))
    if one:
        by_class[1] = one
    if two:
        by_class[2] = two
    if three:
        by_class[3] = three
    return by_class


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate synthetic diamonds dataset.")
    ap.add_argument("--screenshots", type=Path, default=Path("artifact_screenshots"))
    ap.add_argument("--out", type=Path, default=Path("data/diamonds_dataset"))
    ap.add_argument("--per-class", type=int, default=220)
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    random.seed(args.seed)
    mod = _load_artifact_module()
    artifacts = mod.parse_artifacts(mod.ARTIFACT_TS)
    screenshot_paths = mod.list_screenshots(args.screenshots)
    screenshot_pool = [Image.open(p).convert("RGB") for p in screenshot_paths]

    background_path = Path("assets/background/artifacts-background.png")
    if background_path.exists():
        background_source = Image.open(background_path).convert("RGBA")
    elif screenshot_pool:
        background_source = random.choice(screenshot_pool).convert("RGBA")
    else:
        background_source = Image.new("RGBA", (mod.REF_SIZE, mod.REF_SIZE), (26, 16, 12, 255))

    artifact_refs: list[Image.Image] = []
    excluded_image_url = "/artifacts/legendary/adventurers-chronicle.png"
    for _idx, _artifact_id, _name, image_url in artifacts:
        if image_url == excluded_image_url:
            continue
        ref_path = Path("public") / image_url.lstrip("/")
        if ref_path.exists():
            artifact_refs.append(Image.open(ref_path).convert("RGBA"))
    if not artifact_refs:
        raise RuntimeError("No artifact reference images available for diamonds dataset generation.")

    diamond_ref_options: dict[int, list[Image.Image]] = {}
    for count, ref_paths in _resolve_diamond_ref_paths().items():
        diamond_ref_options[count] = [Image.open(ref_path).convert("RGBA") for ref_path in ref_paths]

    equip_path = Path("assets/equiped/equiped.png")
    equip_img = Image.open(equip_path).convert("RGBA") if equip_path.exists() else None

    def _random_marker():
        mode = random.choice(["none", "number", "equip"])
        if mode == "number":
            return "number", random.randint(2, 24)
        if mode == "equip":
            return "equip", None
        return "none", None

    args.out.mkdir(parents=True, exist_ok=True)
    for d in range(0, 4):
        class_dir = args.out / str(d)
        class_dir.mkdir(parents=True, exist_ok=True)
        forced_diamond_ref_options = None if d == 0 else diamond_ref_options.get(d)
        if d > 0 and not forced_diamond_ref_options:
            raise RuntimeError(f"Missing assets/diamond_refs/{d}.png for class {d}")
        for i in range(args.per_class):
            marker_mode, marker_value = _random_marker()
            ref_img = random.choice(artifact_refs)
            forced_diamond_ref = None if not forced_diamond_ref_options else random.choice(forced_diamond_ref_options)
            full = mod.augment_artifact(
                ref_img=ref_img,
                background_source=background_source,
                diamond_images=[],
                equip_img=equip_img,
                forced_marker_mode=marker_mode,
                forced_number_value=marker_value,
                forced_diamond_ref=forced_diamond_ref,
            ).convert("RGB")
            crop_size = int(round(mod.REF_SIZE * 0.685))
            top = mod.REF_SIZE - crop_size
            out = full.crop((0, top, crop_size, mod.REF_SIZE))
            out.save(class_dir / f"{i:05d}.png")

    print("done")


if __name__ == "__main__":
    main()
