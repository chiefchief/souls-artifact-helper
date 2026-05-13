#!/usr/bin/env python3
from __future__ import annotations

import argparse
import re
import shutil
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Sequence, Tuple

from PIL import Image, ImageFilter, ImageOps


@dataclass
class RefArtifact:
    artifact_id: str
    ref_path: Path
    feat: dict


def parse_id_image_map(ts_path: Path) -> Dict[str, str]:
    text = ts_path.read_text(encoding="utf-8")
    pattern = re.compile(r"id:\s*'([^']+)'[\s\S]*?imageUrl:\s*'([^']+)'", re.MULTILINE)
    mapping: Dict[str, str] = {}
    for artifact_id, image_url in pattern.findall(text):
        fname = Path(image_url).name
        mapping[fname] = artifact_id
    return mapping


def center_crop(img: Image.Image, ratio: float = 0.72) -> Image.Image:
    w, h = img.size
    cw, ch = int(w * ratio), int(h * ratio)
    left = (w - cw) // 2
    top = (h - ch) // 2
    return img.crop((left, top, left + cw, top + ch))


def preprocess(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    bg = Image.new("RGBA", rgba.size, (255, 255, 255, 255))
    bg.alpha_composite(rgba)
    return bg.convert("RGB")


def ahash(img: Image.Image, size: int = 16) -> List[int]:
    g = img.convert("L").resize((size, size), Image.Resampling.BILINEAR)
    px = list(g.getdata())
    mean = sum(px) / len(px)
    return [1 if p > mean else 0 for p in px]


def dhash(img: Image.Image, size: int = 16) -> List[int]:
    g = img.convert("L").resize((size + 1, size), Image.Resampling.BILINEAR)
    px = list(g.getdata())
    out: List[int] = []
    row_w = size + 1
    for y in range(size):
        row = px[y * row_w : (y + 1) * row_w]
        for x in range(size):
            out.append(1 if row[x + 1] > row[x] else 0)
    return out


def edge_hist(img: Image.Image, bins: int = 24) -> List[float]:
    edge = img.convert("L").filter(ImageFilter.FIND_EDGES).resize((96, 96), Image.Resampling.BILINEAR)
    hist = edge.histogram()
    bucket = [0.0] * bins
    for value, cnt in enumerate(hist):
        bucket[min(value * bins // 256, bins - 1)] += float(cnt)
    s = sum(bucket) or 1.0
    return [x / s for x in bucket]


def rgb_hist(img: Image.Image, bins: int = 16) -> List[float]:
    small = img.resize((96, 96), Image.Resampling.BILINEAR)
    r = [0.0] * bins
    g = [0.0] * bins
    b = [0.0] * bins
    for pr, pg, pb in small.getdata():
        r[min(pr * bins // 256, bins - 1)] += 1.0
        g[min(pg * bins // 256, bins - 1)] += 1.0
        b[min(pb * bins // 256, bins - 1)] += 1.0
    n = float(96 * 96)
    return [x / n for x in (r + g + b)]


def phash_like(img: Image.Image, size: int = 32) -> List[int]:
    # Keep it dependency-free: blur + autocontrast + threshold map acts as robust shape descriptor.
    g = ImageOps.autocontrast(img.convert("L").resize((size, size), Image.Resampling.BILINEAR).filter(ImageFilter.GaussianBlur(0.8)))
    px = list(g.getdata())
    med = sorted(px)[len(px) // 2]
    return [1 if p > med else 0 for p in px]


def build_features(path: Path) -> dict:
    with Image.open(path) as raw:
        crop = center_crop(raw, ratio=0.72)
        img = preprocess(crop)
    return {
        "a": ahash(img),
        "d": dhash(img),
        "p": phash_like(img),
        "e": edge_hist(img),
        "h": rgb_hist(img),
    }


def hamming(a: Sequence[int], b: Sequence[int]) -> float:
    return sum(1 for x, y in zip(a, b) if x != y) / max(1, len(a))


def l1(a: Sequence[float], b: Sequence[float]) -> float:
    return sum(abs(x - y) for x, y in zip(a, b)) / max(1, len(a))


def distance(f1: dict, f2: dict) -> float:
    return (
        0.24 * hamming(f1["a"], f2["a"])
        + 0.24 * hamming(f1["d"], f2["d"])
        + 0.24 * hamming(f1["p"], f2["p"])
        + 0.16 * l1(f1["e"], f2["e"])
        + 0.12 * l1(f1["h"], f2["h"])
    )


def ensure_train_dirs(train_root: Path, ids: Sequence[str]) -> None:
    for artifact_id in sorted(set(ids)):
        (train_root / artifact_id).mkdir(parents=True, exist_ok=True)


def next_sample_index(class_dir: Path) -> int:
    existing = []
    for p in class_dir.glob("sample-*.png"):
        m = re.match(r"sample-(\d+)\.png$", p.name)
        if m:
            existing.append(int(m.group(1)))
    return (max(existing) + 1) if existing else 1


def collect_refs(project_root: Path, file_to_id: Dict[str, str]) -> List[RefArtifact]:
    refs: List[RefArtifact] = []
    for folder in (project_root / "public" / "artifacts" / "legendary", project_root / "public" / "artifacts" / "mythic"):
        for p in sorted(folder.glob("*.png")):
            artifact_id = file_to_id.get(p.name)
            if not artifact_id:
                continue
            refs.append(RefArtifact(artifact_id=artifact_id, ref_path=p, feat=build_features(p)))
    if not refs:
        raise RuntimeError("No references loaded from public/artifacts using artifactImageCollections.ts")
    return refs


def classify_one(img_path: Path, refs: Sequence[RefArtifact]) -> Tuple[RefArtifact, float, float]:
    feat = build_features(img_path)
    ranked: List[Tuple[float, RefArtifact]] = sorted(
        ((distance(feat, r.feat), r) for r in refs),
        key=lambda x: x[0],
    )
    best_score, best_ref = ranked[0]
    second_score = ranked[1][0] if len(ranked) > 1 else 1.0
    return best_ref, best_score, second_score - best_score


def run(project_root: Path, dry_run: bool = False) -> None:
    ts_path = project_root / "src" / "data" / "artifactImageCollections.ts"
    train_root = project_root / "dataset" / "train"
    unrec_root = project_root / "dataset" / "a_unrecognizable"

    file_to_id = parse_id_image_map(ts_path)
    ensure_train_dirs(train_root, list(file_to_id.values()))
    refs = collect_refs(project_root, file_to_id)

    src_files = sorted([p for p in unrec_root.iterdir() if p.is_file() and p.suffix.lower() in {".png", ".jpg", ".jpeg", ".webp"}])

    placed = 0
    for src in src_files:
        best_ref, score, margin = classify_one(src, refs)
        dst_dir = train_root / best_ref.artifact_id
        idx = next_sample_index(dst_dir)
        dst = dst_dir / f"sample-{idx:02d}.png"

        if dry_run:
            print(f"DRY {src.name} -> {best_ref.artifact_id}/{dst.name} score={score:.4f} margin={margin:.4f}")
            continue

        with Image.open(src) as im:
            im.convert("RGBA").save(dst, format="PNG")
        src.unlink()
        placed += 1
        print(f"MOVE {src.name} -> {best_ref.artifact_id}/{dst.name} score={score:.4f} margin={margin:.4f}")

    mode = "DRY-RUN" if dry_run else "DONE"
    print(f"{mode}: processed={len(src_files)} placed={placed} remaining_in_a_unrecognizable={len(list(unrec_root.glob('*')))}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Classify artifact images from dataset/a_unrecognizable into dataset/train/[artifact-id].")
    parser.add_argument("--project-root", default=".", help="Path to repository root")
    parser.add_argument("--dry-run", action="store_true", help="Preview placement without moving files")
    args = parser.parse_args()
    run(Path(args.project_root).resolve(), dry_run=args.dry_run)


if __name__ == "__main__":
    main()
