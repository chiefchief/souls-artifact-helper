#!/usr/bin/env python3
from __future__ import annotations

import argparse
import io
import random
import re
from pathlib import Path
from typing import List, Tuple

from PIL import Image, ImageEnhance, ImageFilter, ImageOps, ImageDraw, ImageFont


ARTIFACT_TS = Path('src/data/artifactImageCollections.ts')
REF_SIZE = 128
QTY_SIZE = 96
ARTIFACT_CANVAS_SIZE = 114
OFFSET_MIN = -8
OFFSET_MAX = 22


def _extract_array_block(text: str, var_name: str) -> str:
    start = text.find(f"const {var_name}")
    if start < 0:
        return ""
    eq = text.find("=", start)
    if eq < 0:
        return ""
    bracket = text.find("[", eq)
    if bracket < 0:
        return ""
    depth = 0
    for i in range(bracket, len(text)):
        ch = text[i]
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                return text[bracket + 1 : i]
    return ""


def _extract_object_literals(array_block: str) -> List[str]:
    objs: List[str] = []
    depth = 0
    obj_start = -1
    for i, ch in enumerate(array_block):
        if ch == "{":
            if depth == 0:
                obj_start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and obj_start >= 0:
                objs.append(array_block[obj_start : i + 1])
                obj_start = -1
    return objs


def parse_artifacts(ts_path: Path) -> List[Tuple[int, str, str, str]]:
    text = ts_path.read_text(encoding="utf-8")
    blocks = [
        _extract_array_block(text, "mythicArtifacts"),
        _extract_array_block(text, "legendaryArtifacts"),
    ]

    artifacts: List[Tuple[int, str, str, str]] = []
    idx = 0
    for block in blocks:
        for obj in _extract_object_literals(block):
            id_match = re.search(r"id:\s*'([^']+)'", obj)
            img_match = re.search(r"imageUrl:\s*'([^']+)'", obj)
            name_match = re.search(r"name:\s*'([^']+)'", obj)
            if not id_match or not img_match:
                continue
            artifact_id = id_match.group(1)
            image_url = img_match.group(1)
            name = name_match.group(1) if name_match else artifact_id
            artifacts.append((idx, artifact_id, name, image_url))
            idx += 1

    if len(artifacts) < 62:
        raise RuntimeError(
            f"Failed to parse full artifact list from artifactImageCollections.ts (parsed={len(artifacts)})"
        )
    return artifacts


def list_screenshots(folder: Path) -> List[Path]:
    return [p for p in folder.rglob('*') if p.suffix.lower() in {'.png', '.jpg', '.jpeg', '.webp'}]


def random_patch(img: Image.Image, size: int = REF_SIZE) -> Image.Image:
    if img.width < size or img.height < size:
        img = img.resize((max(size, img.width), max(size, img.height)), Image.Resampling.BICUBIC)
    x = random.randint(0, img.width - size)
    y = random.randint(0, img.height - size)
    return img.crop((x, y, x + size, y + size))


def add_jpeg_noise(img: Image.Image, quality: int) -> Image.Image:
    buf = io.BytesIO()
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(buf, format='JPEG', quality=quality)
    buf.seek(0)
    return Image.open(buf).convert('RGBA')


def trim_alpha_bounds(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    alpha = rgba.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        return rgba
    return rgba.crop(bbox)


def _compose_artifact_tile(
    ref_img: Image.Image,
    diamond_images: List[Image.Image],
    equip_img: Image.Image | None,
    forced_marker_mode: str | None = None,
    forced_number_value: int | None = None,
    forced_diamond_ref: Image.Image | None = None,
) -> Image.Image:
    tile = ref_img.convert("RGBA").resize((ARTIFACT_CANVAS_SIZE, ARTIFACT_CANVAS_SIZE), Image.Resampling.BICUBIC)
    draw = ImageDraw.Draw(tile)
    try:
        plus_font = ImageFont.truetype(
            "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
            random.randint(max(14, int(ARTIFACT_CANVAS_SIZE * 0.16)), max(18, int(ARTIFACT_CANVAS_SIZE * 0.22))),
        )
    except Exception:
        plus_font = ImageFont.load_default()

    # Optional top-left random circle marker.
    if random.random() < 0.35:
        mr = max(4, int(ARTIFACT_CANVAS_SIZE * random.uniform(0.06, 0.095)))
        mx = random.randint(1, max(1, int(ARTIFACT_CANVAS_SIZE * 0.12)))
        my = random.randint(1, max(1, int(ARTIFACT_CANVAS_SIZE * 0.10)))
        draw.ellipse((mx, my, mx + mr * 2, my + mr * 2), fill=(232, 232, 232, 245), outline=(46, 46, 46, 225), width=1)

    # Optional +N modifier near top-right.
    if random.random() < 0.30:
        txt = f"+{random.randint(1, 50)}"
        tw, th = draw.textbbox((0, 0), txt, font=plus_font)[2:4]
        px = ARTIFACT_CANVAS_SIZE - tw - random.randint(4, max(4, int(ARTIFACT_CANVAS_SIZE * 0.11)))
        py = random.randint(1, max(1, int(ARTIFACT_CANVAS_SIZE * 0.12)))
        for ox in (-1, 0, 1):
            for oy in (-1, 0, 1):
                if ox == 0 and oy == 0:
                    continue
                draw.text((px + ox, py + oy), txt, font=plus_font, fill=(0, 0, 0, 235))
        draw.text((px, py), txt, font=plus_font, fill=(255, 212, 72, 250))

    # Optional diamond overlay from assets/diamond_refs.
    d_ref: Image.Image | None = None
    if forced_diamond_ref is not None:
        d_ref = trim_alpha_bounds(forced_diamond_ref)
    elif diamond_images and random.random() < 0.45:
        d_ref = trim_alpha_bounds(random.choice(diamond_images))
    if d_ref is not None:
        target_w = max(8, int(ARTIFACT_CANVAS_SIZE * (14.0 / 88.0)))
        scale = target_w / max(1, d_ref.width)
        target_h = max(8, int(d_ref.height * scale))
        d_img = d_ref.resize((target_w, target_h), Image.Resampling.BICUBIC)
        dx = int(round(ARTIFACT_CANVAS_SIZE * (8.5 / 88.0)))
        dy = ARTIFACT_CANVAS_SIZE - int(round(ARTIFACT_CANVAS_SIZE * (6.5 / 88.0))) - target_h
        tile.alpha_composite(d_img, (max(0, dx), max(0, dy)))

    # Optional number (2..24) or equip icon. They are mutually exclusive.
    marker_mode = forced_marker_mode or random.choices(["none", "number", "equip"], weights=[0.22, 0.58, 0.20], k=1)[0]
    if marker_mode == "number":
        text = str(forced_number_value if forced_number_value is not None else random.randint(2, 24))
        try:
            # Spec-based character height: 16px on 88px reference grid.
            # For 114px artifact canvas this is ~20.7px.
            qty_size = int(round(ARTIFACT_CANVAS_SIZE * (18.0 / 88.0)))
            qty_font = None
            for font_path in (
                "assets/fonts/Roboto-Medium.ttf",
            ):
                if Path(font_path).exists():
                    qty_font = ImageFont.truetype(font_path, qty_size)
                    break
            if qty_font is None:
                qty_font = ImageFont.load_default()
        except Exception:
            qty_font = ImageFont.load_default()
        bbox = draw.textbbox((0, 0), text, font=qty_font)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        # Exact spec margins scaled from 88x88 reference.
        base_rm = int(round(ARTIFACT_CANVAS_SIZE * (8.0 / 88.0)))
        base_bm = int(round(ARTIFACT_CANVAS_SIZE * (14.0 / 88.0)))
        qx = ARTIFACT_CANVAS_SIZE - base_rm - tw
        qy = ARTIFACT_CANVAS_SIZE - base_bm - th
        qx = max(0, min(qx, ARTIFACT_CANVAS_SIZE - tw))
        qy = max(0, min(qy, ARTIFACT_CANVAS_SIZE - th))
        for ox in (-1, 0, 1):
            for oy in (-1, 0, 1):
                if ox == 0 and oy == 0:
                    continue
                draw.text((qx + ox, qy + oy), text, font=qty_font, fill=(0, 0, 0, 235))
        draw.text((qx, qy), text, font=qty_font, fill=(245, 245, 245, 250))
    elif marker_mode == "equip" and equip_img is not None:
        target = trim_alpha_bounds(equip_img).resize(
            (
                max(8, int(round(ARTIFACT_CANVAS_SIZE * (26.0 / 88.0)))),
                max(8, int(round(ARTIFACT_CANVAS_SIZE * (26.0 / 88.0)))),
            ),
            Image.Resampling.BICUBIC,
        )
        ex = ARTIFACT_CANVAS_SIZE - target.width
        ey = ARTIFACT_CANVAS_SIZE - target.height
        tile.alpha_composite(target, (max(0, ex), max(0, ey)))

    return tile


def augment_artifact(
    ref_img: Image.Image,
    background_source: Image.Image,
    diamond_images: List[Image.Image],
    equip_img: Image.Image | None,
    forced_marker_mode: str | None = None,
    forced_number_value: int | None = None,
    forced_diamond_ref: Image.Image | None = None,
) -> Image.Image:
    tile = _compose_artifact_tile(
        ref_img,
        diamond_images=diamond_images,
        equip_img=equip_img,
        forced_marker_mode=forced_marker_mode,
        forced_number_value=forced_number_value,
        forced_diamond_ref=forced_diamond_ref,
    )
    transformed = tile

    # Keep controlled augmentation while preserving composition order and proportions.
    if random.random() < 0.65:
        transformed = transformed.rotate(random.uniform(-4.0, 4.0), expand=True)
    if random.random() < 0.5:
        scale = random.uniform(0.96, 1.04)
        nw = max(8, int(transformed.width * scale))
        nh = max(8, int(transformed.height * scale))
        transformed = transformed.resize((nw, nh), Image.Resampling.BICUBIC)

    background = random_patch(background_source, REF_SIZE).convert("RGBA")
    background = ImageEnhance.Brightness(background).enhance(random.uniform(0.82, 1.18))
    background = ImageEnhance.Contrast(background).enhance(random.uniform(0.84, 1.22))

    dx = random.randint(OFFSET_MIN, OFFSET_MAX)
    dy = random.randint(OFFSET_MIN, OFFSET_MAX)
    background.alpha_composite(transformed, (dx, dy))

    # Stronger color/tonal diversity similar to previous generator behavior.
    background = ImageEnhance.Brightness(background).enhance(random.uniform(0.76, 1.28))
    background = ImageEnhance.Contrast(background).enhance(random.uniform(0.76, 1.34))
    background = ImageEnhance.Color(background).enhance(random.uniform(0.70, 1.30))

    if random.random() < 0.45:
        background = background.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.1, 0.6)))
    if random.random() < 0.85:
        background = add_jpeg_noise(background, quality=random.randint(35, 95))

    return background.convert("RGB")


def augment_artifact_cell(
    ref_img: Image.Image,
    screenshot_pool: List[Image.Image],
    diamond_refs: dict[int, Image.Image] | None = None,
) -> Image.Image:
    # Build screenshot-like cell background.
    cell = Image.new('RGBA', (REF_SIZE, REF_SIZE), (28, 18, 12, 255))
    if screenshot_pool:
        patch = random_patch(random.choice(screenshot_pool), REF_SIZE).convert('RGBA')
        patch = ImageEnhance.Brightness(patch).enhance(random.uniform(0.35, 0.8))
        patch = ImageEnhance.Color(patch).enhance(random.uniform(0.55, 1.1))
        cell = Image.blend(cell, patch, alpha=random.uniform(0.10, 0.22))

    # Place the full artifact tile (already contains authentic slot border/icon style).
    profile_roll = random.random()
    if profile_roll < 0.25:
        icon_scale_min, icon_scale_max = 0.90, 0.98
        jitter_x, jitter_y = 2, 2
    elif profile_roll < 0.75:
        icon_scale_min, icon_scale_max = 0.78, 0.90
        jitter_x, jitter_y = 5, 6
    else:
        icon_scale_min, icon_scale_max = 0.68, 0.80
        jitter_x, jitter_y = 8, 10

    tile = ref_img.convert('RGBA')
    tile_scale = random.uniform(icon_scale_min, icon_scale_max)
    tile_size = max(64, int(REF_SIZE * tile_scale))
    tile = tile.resize((tile_size, tile_size), Image.Resampling.BICUBIC)
    tx = int((REF_SIZE - tile_size) / 2 + random.uniform(-jitter_x, jitter_x))
    ty = int((REF_SIZE - tile_size) / 2 + random.uniform(-jitter_y, jitter_y))
    tx = min(max(0, tx), max(0, REF_SIZE - tile_size))
    ty = min(max(0, ty), max(0, REF_SIZE - tile_size))
    cell.alpha_composite(tile, (tx, ty))

    draw = ImageDraw.Draw(cell)
    try:
        qty_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', random.randint(21, 30))
        plus_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', random.randint(20, 28))
    except Exception:
        qty_font = ImageFont.load_default()
        plus_font = ImageFont.load_default()

    # Optional top-left marker (small gray badge like screenshots).
    if random.random() < 0.35:
        mx = tx + random.randint(4, max(4, int(tile_size * 0.14)))
        my = ty + random.randint(3, max(3, int(tile_size * 0.12)))
        mr = max(4, int(tile_size * 0.085))
        draw.ellipse((mx, my, mx + mr * 2, my + mr * 2), fill=(228, 228, 228, 245), outline=(55, 55, 55, 220), width=1)

    # Optional enhancement text (+N) near top-right.
    if random.random() < 0.28:
        txt = f"+{random.choice([10, 20, 30])}"
        tw, th = draw.textbbox((0, 0), txt, font=plus_font)[2:4]
        px = tx + tile_size - tw - random.randint(4, max(4, int(tile_size * 0.12)))
        py = ty + random.randint(2, max(2, int(tile_size * 0.12)))
        for ox in (-1, 0, 1):
            for oy in (-1, 0, 1):
                if ox == 0 and oy == 0:
                    continue
                draw.text((px + ox, py + oy), txt, font=plus_font, fill=(0, 0, 0, 230))
        draw.text((px, py), txt, font=plus_font, fill=(255, 208, 64, 250))

    # Optional red diamond near bottom-left, always inside the tile.
    # Use only real game refs from assets/diamond_refs.
    if random.random() < 0.30:
        if diamond_refs:
            d_count = random.choice([1, 2, 3])
            d_ref = diamond_refs.get(d_count)
            if d_ref is not None:
                d_ref = trim_alpha_bounds(d_ref)
                # Match spec: for 284 tile, diamond stack width ~=48 (ratio 0.169),
                # with small jitter for robustness.
                target_w = max(8, int(tile_size * random.uniform(0.164, 0.174)))
                scale = target_w / max(1, d_ref.width)
                target_h = max(8, int(d_ref.height * scale))
                d_img = d_ref.resize((target_w, target_h), Image.Resampling.BICUBIC)
                dx = tx + random.randint(4, max(4, int(tile_size * 0.14)))
                dy = ty + tile_size - target_h - random.randint(3, max(3, int(tile_size * 0.10)))
                dx = min(max(tx + 1, dx), tx + tile_size - target_w - 1)
                dy = min(max(ty + 1, dy), ty + tile_size - target_h - 1)
                cell.alpha_composite(d_img, (dx, dy))

    # Optional quantity number near bottom-right, always inside the tile.
    if random.random() < 0.72:
        txt = str(random.randint(1, 9))
        tw, th = draw.textbbox((0, 0), txt, font=qty_font)[2:4]
        qx = tx + tile_size - tw - random.randint(4, max(4, int(tile_size * 0.13)))
        qy = ty + tile_size - th - random.randint(3, max(3, int(tile_size * 0.12)))
        for ox in (-1, 0, 1):
            for oy in (-1, 0, 1):
                if ox == 0 and oy == 0:
                    continue
                draw.text((qx + ox, qy + oy), txt, font=qty_font, fill=(0, 0, 0, 235))
        draw.text((qx, qy), txt, font=qty_font, fill=(245, 245, 245, 250))

    cell = ImageEnhance.Brightness(cell).enhance(random.uniform(0.8, 1.25))
    cell = ImageEnhance.Contrast(cell).enhance(random.uniform(0.8, 1.35))
    cell = ImageEnhance.Color(cell).enhance(random.uniform(0.7, 1.3))
    if random.random() < 0.25:
        cell = cell.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.1, 0.45)))
    if random.random() < 0.60:
        cell = add_jpeg_noise(cell, quality=random.randint(55, 95))
    return cell.convert('RGB')


def _draw_diamond(draw: ImageDraw.ImageDraw, cx: int, cy: int, r: int) -> None:
    # Outer gem body (orange-red), less saturated than before.
    outer = [(cx, cy - r), (cx + r, cy), (cx, cy + r), (cx - r, cy)]
    draw.polygon(outer, fill=(226, 95, 26, 255), outline=(245, 188, 92, 255))

    # Inner bright core
    r2 = max(1, int(r * 0.52))
    inner = [(cx, cy - r2), (cx + r2, cy), (cx, cy + r2), (cx - r2, cy)]
    draw.polygon(inner, fill=(248, 154, 52, 255))

    # Tiny highlight on top-left to mimic game specular shine.
    hl = max(1, int(r * 0.22))
    draw.polygon(
        [(cx - hl, cy - r + hl), (cx, cy - r + hl + 1), (cx - hl // 2, cy - r + hl + 3)],
        fill=(255, 228, 158, 210),
    )


def make_quantity_badge(
    value: int,
    screenshot_pool: List[Image.Image],
    mode: str = "number",
    diamond_refs: dict[int, Image.Image] | None = None,
) -> Image.Image:
    img = Image.new('RGBA', (QTY_SIZE, QTY_SIZE), (14, 8, 8, 255))

    if screenshot_pool:
        patch = random_patch(random.choice(screenshot_pool), QTY_SIZE).convert('RGBA')
        patch = ImageEnhance.Brightness(patch).enhance(random.uniform(0.3, 0.7))
        img = Image.blend(img, patch, alpha=random.uniform(0.1, 0.2))

    draw = ImageDraw.Draw(img)

    if mode == "diamonds":
        # left-bottom diamonds, same semantics as the app logic:
        # 0 diamonds -> qty 1, 1-2 diamonds -> qty 2, 3 diamonds -> qty 4
        count = 0
        if value == 2:
            count = random.choice([1, 2])
        elif value == 4:
            count = 3
        if diamond_refs and count in diamond_refs:
            ref = diamond_refs[count].convert("RGBA")
            target_h = int(QTY_SIZE * 0.42)
            scale = target_h / max(1, ref.height)
            target_w = max(8, int(ref.width * scale))
            resized = ref.resize((target_w, target_h), Image.Resampling.BICUBIC)
            # Wider placement jitter: allow larger left and bottom offsets.
            px = int(QTY_SIZE * random.uniform(0.03, 0.14))
            py = int(QTY_SIZE * random.uniform(0.50, 0.62))
            img.alpha_composite(resized, (px, py))
        else:
            # fallback synthetic diamonds
            base_x = int(QTY_SIZE * 0.12)
            base_y = int(QTY_SIZE * 0.80)
            r = max(3, QTY_SIZE // 16)
            for i in range(count):
                cx = base_x
                cy = base_y - i * int(r * 1.55)
                _draw_diamond(draw, cx, cy, r=r)
    elif mode == "number":
        # soft badge area in bottom-right like the game UI
        # Wider placement jitter: include larger right/bottom offsets.
        bx0 = int(QTY_SIZE * random.uniform(0.48, 0.60))
        by0 = int(QTY_SIZE * random.uniform(0.56, 0.70))
        bx1 = int(QTY_SIZE * random.uniform(0.90, 0.98))
        by1 = int(QTY_SIZE * random.uniform(0.90, 0.98))
        draw.rounded_rectangle((bx0, by0, bx1, by1), radius=8, fill=(26, 18, 18, 220))

        if value > 0:
            try:
                font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', random.randint(28, 38))
            except Exception:
                font = ImageFont.load_default()

            text = str(value)
            tw, th = draw.textbbox((0, 0), text, font=font)[2:4]
            tx = bx0 + (bx1 - bx0 - tw) // 2 + random.randint(-1, 1)
            ty = by0 + (by1 - by0 - th) // 2 + random.randint(-1, 1)

            # outline + white text
            for ox in (-1, 0, 1):
                for oy in (-1, 0, 1):
                    if ox == 0 and oy == 0:
                        continue
                    draw.text((tx + ox, ty + oy), text, font=font, fill=(0, 0, 0, 255))
            draw.text((tx, ty), text, font=font, fill=(245, 245, 245, 255))
    elif mode == "equip":
        # Import equipped marker from app assets and place into number ROI.
        ref_path = Path('public/equip_refs/E.png')
        if ref_path.exists():
            e_img = Image.open(ref_path).convert("RGBA")
            target_h = int(QTY_SIZE * random.uniform(0.31, 0.39))
            scale = target_h / max(1, e_img.height)
            target_w = max(8, int(e_img.width * scale))
            e_img = e_img.resize((target_w, target_h), Image.Resampling.BICUBIC)

            # Mix placement profiles so model doesn't overfit "always pinned to corner".
            # 1) tight corner (game-like), 2) small inset, 3) medium inset.
            roll = random.random()
            if roll < 0.45:
                inset_r = random.randint(0, 2)
                inset_b = random.randint(0, 2)
            elif roll < 0.80:
                inset_r = random.randint(3, 7)
                inset_b = random.randint(3, 7)
            else:
                inset_r = random.randint(8, 13)
                inset_b = random.randint(8, 13)

            px = QTY_SIZE - target_w - inset_r
            py = QTY_SIZE - target_h - inset_b
            px = min(max(0, px), max(0, QTY_SIZE - target_w))
            py = min(max(0, py), max(0, QTY_SIZE - target_h))
            img.alpha_composite(e_img, (px, py))
    elif mode == "empty":
        # No right-bottom badge marker. Quantity should be interpreted as 1.
        pass

    img = ImageEnhance.Brightness(img).enhance(random.uniform(0.85, 1.18))
    img = ImageEnhance.Contrast(img).enhance(random.uniform(0.85, 1.22))
    if random.random() < 0.6:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.15, 0.8)))
    if random.random() < 0.85:
        img = add_jpeg_noise(img, quality=random.randint(40, 95))

    return img.convert('RGB')


def make_diamond_only_patch(
    diamond_class: int,
    screenshot_pool: List[Image.Image],
    diamond_refs: dict[int, Image.Image] | None = None,
) -> Image.Image:
    img = Image.new("RGBA", (QTY_SIZE, QTY_SIZE), (28, 18, 12, 255))
    if screenshot_pool:
        patch = random_patch(random.choice(screenshot_pool), QTY_SIZE).convert("RGBA")
        patch = ImageEnhance.Brightness(patch).enhance(random.uniform(0.55, 1.0))
        patch = ImageEnhance.Color(patch).enhance(random.uniform(0.75, 1.15))
        img = Image.blend(img, patch, alpha=random.uniform(0.15, 0.35))

    if diamond_class > 0:
        if not (diamond_refs and diamond_class in diamond_refs):
            raise RuntimeError(
                f"Missing diamond ref image for class {diamond_class}. Expected assets/diamond_refs/{diamond_class}.png"
            )
        ref = diamond_refs[diamond_class].convert("RGBA")
        # Keep per-diamond size fixed regardless of stack count.
        # Reference from user: for 284x284 slot -> diamond width ~48 (~16.9%),
        # left offset ~26 (~9.2%), bottom offset ~20 (~7.0%).
        per_diamond_w = int(QTY_SIZE * 0.169)
        expected_stack_h = per_diamond_w + (diamond_class - 1) * int(per_diamond_w * 0.85)
        target_w = max(8, per_diamond_w)
        target_h = max(8, expected_stack_h)

        # Resize stack to fixed dimensions derived from per-diamond target.
        resized = ref.resize((target_w, target_h), Image.Resampling.BICUBIC)

        # Larger left/bottom offset variability for better generalization.
        left_ratio = random.uniform(0.05, 0.16)
        bottom_ratio = random.uniform(0.04, 0.13)
        px = int(QTY_SIZE * left_ratio) + random.randint(-1, 1)
        py = int(QTY_SIZE * (1 - bottom_ratio) - target_h) + random.randint(-1, 1)
        img.alpha_composite(resized, (px, py))

    img = ImageEnhance.Brightness(img).enhance(random.uniform(0.95, 1.25))
    img = ImageEnhance.Contrast(img).enhance(random.uniform(0.85, 1.22))
    if random.random() < 0.6:
        img = img.filter(ImageFilter.GaussianBlur(radius=random.uniform(0.15, 0.8)))
    if random.random() < 0.85:
        img = add_jpeg_noise(img, quality=random.randint(40, 95))
    return img.convert("RGB")


def generate_artifact_dataset(
    artifacts: List[Tuple[int, str, str, str]],
    screenshot_pool: List[Image.Image],
    diamond_images: List[Image.Image],
    equip_img: Image.Image | None,
    out_dir: Path,
    per_class: int,
    artifact_cell_ratio: float,
) -> None:
    out_dir.mkdir(parents=True, exist_ok=True)
    _ = max(0.0, min(1.0, artifact_cell_ratio))
    background_path = Path("assets/background/artifacts-background.png")
    if background_path.exists():
        background_source = Image.open(background_path).convert("RGBA")
    elif screenshot_pool:
        background_source = random.choice(screenshot_pool).convert("RGBA")
    else:
        background_source = Image.new("RGBA", (REF_SIZE, REF_SIZE), (26, 16, 12, 255))

    for idx, artifact_id, _name, image_url in artifacts:
        ref_path = Path('public') / image_url.lstrip('/')
        if not ref_path.exists():
            print(f'skip missing ref: {ref_path}')
            continue

        ref_img = Image.open(ref_path).convert('RGBA')
        class_dir = out_dir / f'{idx:03d}_{artifact_id}'
        class_dir.mkdir(parents=True, exist_ok=True)

        for i in range(per_class):
            out = augment_artifact(
                ref_img,
                background_source=background_source,
                diamond_images=diamond_images,
                equip_img=equip_img,
            )
            out.save(class_dir / f'{i:05d}.png')


def main() -> None:
    ap = argparse.ArgumentParser(description='Generate synthetic dataset for artifact model.')
    ap.add_argument('--screenshots', type=Path, default=Path('artifact_screenshots'))
    ap.add_argument('--artifact-out', type=Path, default=Path('data/artifacts_dataset'))
    ap.add_argument(
        '--dataset',
        choices=['all', 'artifact'],
        default='artifact',
        help='Select which dataset to generate.',
    )
    ap.add_argument('--artifact-per-class', type=int, default=220)
    ap.add_argument('--artifact-cell-ratio', type=float, default=0.55,
                    help='Share of artifact samples generated as full screenshot-like cells (0..1).')
    ap.add_argument('--seed', type=int, default=42)
    args = ap.parse_args()

    random.seed(args.seed)

    artifacts = parse_artifacts(ARTIFACT_TS)
    screenshot_paths = list_screenshots(args.screenshots)
    screenshot_pool = [Image.open(p).convert('RGB') for p in screenshot_paths]
    diamond_images: List[Image.Image] = []
    for p in sorted(Path("assets/diamond_refs").glob("*.png")):
        diamond_images.append(Image.open(p).convert("RGBA"))
    equip_path = Path("assets/equiped/equiped.png")
    equip_img = Image.open(equip_path).convert("RGBA") if equip_path.exists() else None

    if args.dataset in ('all', 'artifact'):
        generate_artifact_dataset(
            artifacts=artifacts,
            screenshot_pool=screenshot_pool,
            diamond_images=diamond_images,
            equip_img=equip_img,
            out_dir=args.artifact_out,
            per_class=args.artifact_per_class,
            artifact_cell_ratio=args.artifact_cell_ratio,
        )

    print('done')


if __name__ == '__main__':
    main()
