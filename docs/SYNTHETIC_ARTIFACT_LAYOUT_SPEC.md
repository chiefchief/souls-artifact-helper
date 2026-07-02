# Synthetic Artifact Layout Spec

Base reference tile size: `284x284`.
All generator offsets/sizes are scaled proportionally to current tile size.

## Diamonds (bottom-left)

- left offset: `24 / 284 = 0.0845`
- bottom offset: `18 / 284 = 0.0634`
- stack width: `48 / 284 = 0.1690`

## Equip Marker `E` (bottom-right)

- right offset: `0`
- bottom offset: `0`
- size: `82x82` -> `82 / 284 = 0.2887` of tile width/height

## Quantity Number (bottom-right)

- right offset: `26 / 284 = 0.0915`
- bottom offset: `26 / 284 = 0.0915`
- text height target: `52 / 284 = 0.1831` of tile height

## Training Jitter

Use small noise around these anchors to improve robustness:

- positional jitter: around `+-1%` of tile size
- size jitter: around `+-3%` of tile size for overlays

The jitter should be small enough to preserve realistic in-game geometry.
