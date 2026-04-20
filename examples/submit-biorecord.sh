#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# BSP CLI — Submit BioRecords to a BEO
# ──────────────────────────────────────────────────────────────
# This script submits biological measurements (blood test,
# wearable readings, etc.) from an IEO to a BEO, authorized by
# a ConsentToken with SUBMIT_RECORD intent.
#
# Usage:  ./submit-biorecord.sh <beo-id> <token-id> <file.json>
# Example: ./submit-biorecord.sh tx_abc123 tok_xyz789 results.json
# ──────────────────────────────────────────────────────────────

set -euo pipefail

BEO_ID="${1:-}"
TOKEN_ID="${2:-}"
FILE="${3:-}"

if [[ -z "$BEO_ID" || -z "$TOKEN_ID" || -z "$FILE" ]]; then
  cat <<EOF
usage: $0 <beo-id> <token-id> <records-file.json>

example: $0 tx_abc123... tok_xyz789... ./blood-panel.json

records-file.json format:
[
  {
    "categoryCode":  "BSP-HM",
    "biomarkerCode": "BSP-HM-HGB",
    "value":         14.2,
    "unit":          "g/dL",
    "referenceRange": { "min": 12.0, "max": 16.0 },
    "collectedAt":   "2026-04-15T08:30:00Z"
  },
  {
    "categoryCode":  "BSP-HM",
    "biomarkerCode": "BSP-HM-HCT",
    "value":         42.1,
    "unit":          "%",
    "referenceRange": { "min": 36, "max": 48 },
    "collectedAt":   "2026-04-15T08:30:00Z"
  }
]

required:
  - IEO private key set in config (bsp config set private-key ...)
  - ConsentToken with SUBMIT_RECORD intent matching your IEO
EOF
  exit 1
fi

if [[ ! -f "$FILE" ]]; then
  echo "error: file not found: $FILE"
  exit 1
fi

echo "─── 1. Verify the ConsentToken is valid ───"
bsp consent verify "$TOKEN_ID"

echo
echo "─── 2. Submit BioRecords ───"
bsp records submit "$BEO_ID" \
  --token "$TOKEN_ID" \
  --file "$FILE"

echo
echo "─── 3. (Optional) Read back the records you just submitted ───"
read -rp "Read back? (y/N) " rb
if [[ "$rb" == "y" ]]; then
  bsp records read "$BEO_ID" --token "$TOKEN_ID" --json | head -40
fi

echo
echo "Done. Records are permanently stored on Arweave."
