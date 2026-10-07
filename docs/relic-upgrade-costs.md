# Relic upgrade costs

Source: https://souls-helper-omut-b1430d.gitlab.io/en/relics

Public data asset: https://souls-helper-omut-b1430d.gitlab.io/assets/Relics-CSlrZLEw.js

Retrieved: 2026-10-07. Data: `src/data/relicUpgradeCosts.json`.

Each row describes one upgrade from `level` to `level + 1`. To calculate a range, sum rows from the current level (inclusive) to the target level (exclusive). Missing resource fields mean zero. All three attributes use the same costs.

- Non-seal: Forgotten Water of Life, Forgotten Forest Essence, Forgotten Flower Bud.
- Seal: Clock of Memories, Compass of Memories, Key of Memories.

The quantities match between the two categories; only resource names differ. Each table contains 60 transitions, from 0→1 through 59→60.

Source values preserved exactly, including 49→50 costing 700 Water / Clocks (not 1,000), and 59→60 costing 450 Essence / Compasses. These are source data, not independently verified game values.

Total for one relic from 0→60: 27,100 Water / Clocks, 9,550 Essence / Compasses, 630 Buds / Keys.
