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


def _generate_and_crop(
    mod,
    artifact_refs: list[Image.Image],
    background_source: Image.Image,
    diamond_images: list[Image.Image],
    equip_img: Image.Image | None,
    marker_mode: str,
    number_value: int | None,
) -> Image.Image:
    ref_img = random.choice(artifact_refs)
    full = mod.augment_artifact(
        ref_img=ref_img,
        background_source=background_source,
        diamond_images=diamond_images,
        equip_img=equip_img,
        forced_marker_mode=marker_mode,
        forced_number_value=number_value,
    ).convert("RGB")
    # Quantity dataset sample = right-bottom quarter of 128x128 composed image.
    return full.crop((mod.REF_SIZE // 2, mod.REF_SIZE // 2, mod.REF_SIZE, mod.REF_SIZE))


def main() -> None:
    ap = argparse.ArgumentParser(description="Generate synthetic quantity dataset from artifact-style pipeline.")
    ap.add_argument("--screenshots", type=Path, default=Path("artifact_screenshots"))
    ap.add_argument("--out", type=Path, default=Path("data/quantity_dataset"))
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
    for _idx, _artifact_id, _name, image_url in artifacts:
        ref_path = Path("public") / image_url.lstrip("/")
        if ref_path.exists():
            artifact_refs.append(Image.open(ref_path).convert("RGBA"))
    if not artifact_refs:
        raise RuntimeError("No artifact reference images available for quantity dataset generation.")

    diamond_images: list[Image.Image] = []
    for p in sorted(Path("assets/diamond_refs").glob("*.png")):
        diamond_images.append(Image.open(p).convert("RGBA"))
    equip_path = Path("assets/equiped/equiped.png")
    equip_img = Image.open(equip_path).convert("RGBA") if equip_path.exists() else None

    args.out.mkdir(parents=True, exist_ok=True)

    special_classes = [("none", "none"), ("equip", "equip")]
    for class_name, marker_mode in special_classes:
        class_dir = args.out / class_name
        class_dir.mkdir(parents=True, exist_ok=True)
        for i in range(args.per_class):
            out = _generate_and_crop(
                mod=mod,
                artifact_refs=artifact_refs,
                background_source=background_source,
                diamond_images=diamond_images,
                equip_img=equip_img,
                marker_mode=marker_mode,
                number_value=None,
            )
            out.save(class_dir / f"{i:05d}.png")

    for qty in range(1, 25):
        class_dir = args.out / f"{qty:02d}"
        class_dir.mkdir(parents=True, exist_ok=True)
        for i in range(args.per_class):
            out = _generate_and_crop(
                mod=mod,
                artifact_refs=artifact_refs,
                background_source=background_source,
                diamond_images=diamond_images,
                equip_img=equip_img,
                marker_mode="number",
                number_value=qty,
            )
            out.save(class_dir / f"{i:05d}.png")

    print("done")


if __name__ == "__main__":
    main()
