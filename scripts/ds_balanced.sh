#!/usr/bin/env bash
set -euo pipefail

# Balanced dataset generation (recommended default)
bash scripts/artifact/ds_balanced.sh
bash scripts/quantity/ds_balanced.sh
bash scripts/diamonds/ds_balanced.sh

echo "[ok] balanced datasets generated"
