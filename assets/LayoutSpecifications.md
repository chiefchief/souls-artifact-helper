# Layout Specifications: Artifact UI Components

This document defines the geometric constraints, dimensions, and spatial relationships of UI elements within an artifact slot. All measurements are based on a reference grid of **88×88 pixels**.

---

## 1. Base Container (Artifact Slot)

- **Base Size:** 88×88 px
- **Coordinate System:** Origin (0,0) is at the Top-Left corner.
- **Primary Content:** The entire 88×88 area is designated for the Artifact Body image.

---

## 2. Equipment Identifier (Equip Icon "E")

| Parameter          | Value        | Description                           |
| :----------------- | :----------- | :------------------------------------ |
| **Dimensions**     | 26×26 px     | Square icon containing the "E" symbol |
| **Positioning**    | Bottom-Right | Anchored to the bottom-right corner   |
| **Margins (X, Y)** | 0 px, 0 px   | Zero offset from the container edges  |

**Coordinate Calculation:**

- `x = 88 - 26 = 62`
- `y = 88 - 26 = 62`

---

## 3. Quantity Label (Numeric/Level)

- **Character Height:** 16 px
- **Positioning:** Bottom-Right with specific offsets
- **Right Margin:** 8 px
- **Bottom Margin:** 9 px
- **Format variants:** plain digits (2–99)

---

## 4. Quality Indicators (Diamonds)

| Count          | Total Size (W×H) | Description         |
| :------------- | :--------------- | :------------------ |
| **1 Diamond**  | 14×16 px         | Single icon         |
| **2 Diamonds** | 14×32 px         | Vertical stack      |
| **3 Diamonds** | 14×48 px         | Full vertical stack |

- **Left Margin:** 8.5 px
- **Bottom Margin:** 6.5 px
- **Growth Direction:** Bottom-up
- `y_start = 88 - 6.5 - 16 = 65.5`

---

## 5. Scaling Factors for Model Inference

| Model                | Input Size | Scale Factor    |
| :------------------- | :--------- | :-------------- |
| Artifact Recognition | 128×128    | 1.4545 (128/88) |
| Quantity Recognition | 96×96      | 1.0909 (96/88)  |

---

## 6. Dataset Generation Flow

### 6.1 Common Steps (all dataset types)

```
1. Take artifact image (88×88)
2. Compose elements onto artifact using spec coordinates:
     - E icon:    position (62, 62), size 26×26
     - Quantity:  bottom-right, margin 8px right, 9px bottom
     - Diamonds:  bottom-left, margin 8.5px left, 6.5px bottom
3. Scale the composed artifact (artifact + elements together):
     - Range: 0.9x – 1.1x (random)
     - Constraint: see Section 6.2 for E-specific scale limit
4. Extract a random patch from artifacts-background.png:
     - Quantity model patch: 96×96
     - Artifact model patch: 128×128
5. Place scaled artifact at a random position on the patch
   ── STOP here for artifact recognition dataset ──
6. Crop the bottom quarter (48×48) of the 96×96 patch:
     - Diamonds → bottom-left:  (0,  48, 48, 96)
     - E / Quantity → bottom-right: (48, 48, 96, 96)
7. This 48×48 crop = one training sample
```

### 6.2 Scale Constraint for Equip Icon "E"

The E icon must remain **at least partially visible** in the bottom-right crop even at maximum scale and maximum random offset.

**Reasoning:** The E icon has a distinctive black rounded square with a white letter. Even if the outer border is clipped, the letter itself must be recognizable. This partial visibility is intentional — it improves model robustness to user grid misalignment.

**Recommended maximum scale:** `1.1x`

At 1.1x scale the artifact becomes 97×97 px. The E icon position becomes:

```
x = 62 × 1.1 = 68.2
y = 62 × 1.1 = 68.2
```

On a 96×96 patch with worst-case artifact placement, E will still overlap
the bottom-right crop zone `(48, 48, 96, 96)` sufficiently for recognition.

**If scale exceeds 1.1x:** E may be fully outside the crop zone → sample is
invalid for quantity dataset. Either clamp scale to 1.1x or discard such samples.

---

## 7. Background Resources

| Asset                                        | Size       | Usage                                              |
| :------------------------------------------- | :--------- | :------------------------------------------------- |
| `assets/background/artifacts-background.png` | 508×444 px | Primary patch source for all datasets              |
| `./artifact_screenshots`                     | Various    | Secondary source for additional background variety |

**Sampling:** Random patches are extracted from these assets. The artifact is placed at a random position on the patch to simulate natural grid misalignment by users.

### 7.1 Random Offset Bounds (Artifact Placement)

For artifact dataset generation, use the following fixed placement bounds:

- **Final sample size:** `128×128`
- **Scaled artifact size inside sample:** `114×114`
- **Top-left artifact offset from sample top-left:** `dx, dy ∈ [-8, 22]`

Equivalent placement formula:

```
artifact_top_left_x = dx
artifact_top_left_y = dy
where dx, dy are sampled uniformly from [-8, 22]
```

This range intentionally includes both slight negative and positive offsets so the model sees partial clipping and user-like misalignment.

If another target sample size is used, preserve the same relative geometry (artifact-to-sample ratio and offset ratio) by linear scaling from this 128/114 reference.

---

## 8. Augmentation Rules

| Parameter             | Value                                         | Notes                                    |
| :-------------------- | :-------------------------------------------- | :--------------------------------------- |
| **Scale variance**    | 0.9x – 1.1x                                   | Applied to full composed artifact        |
| **Positional jitter** | Random placement on background patch          | Simulates user grid misalignment         |
| **E visibility**      | Border may be clipped, letter must be visible | See Section 6.2                          |
| **Background**        | Real game textures only                       | No solid colors or synthetic backgrounds |

_NOTE:_
**Artifact image:** 128×128
**Diamond image:** 64×64
**Quantity image:** 64×64
