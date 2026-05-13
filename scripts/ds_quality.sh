#!/usr/bin/env bash
set -euo pipefail

# Higher-quality dataset generation (slower)
bash scripts/artifact/ds_quality.sh
bash scripts/quantity/ds_quality.sh
bash scripts/diamonds/ds_quality.sh

echo "[ok] quality datasets generated"
