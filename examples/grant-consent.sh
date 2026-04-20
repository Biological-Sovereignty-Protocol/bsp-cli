#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# BSP CLI — Grant ConsentToken to an IEO
# ──────────────────────────────────────────────────────────────
# This script issues a ConsentToken from a BEO (patient / holder)
# to an IEO (lab / hospital / wearable), scoped to specific
# intents and categories with an expiry.
#
# Usage:  ./grant-consent.sh <beo-id> <ieo-id>
# Example: ./grant-consent.sh tx_abc123... ieo_def456...
# ──────────────────────────────────────────────────────────────

set -euo pipefail

BEO_ID="${1:-}"
IEO_ID="${2:-}"

if [[ -z "$BEO_ID" || -z "$IEO_ID" ]]; then
  echo "usage: $0 <beo-id> <ieo-id>"
  echo "example: $0 tx_abc123... ieo_def456..."
  echo
  echo "tip: resolve a .bsp domain to get its ID"
  echo "     bsp resolve alice.bsp"
  echo "     bsp ieo list --type LAB"
  exit 1
fi

# Defaults — adjust per use case
INTENTS="${INTENTS:-SUBMIT_RECORD,READ_RECORDS}"
CATEGORIES="${CATEGORIES:-BSP-LA,BSP-HM,BSP-GL}"
DAYS="${DAYS:-365}"

echo "─── Granting ConsentToken ───"
echo "  BEO        $BEO_ID"
echo "  IEO        $IEO_ID"
echo "  Intents    $INTENTS"
echo "  Categories $CATEGORIES"
echo "  Expires    $DAYS days"
echo

read -rp "Confirm? (y/N) " confirm
[[ "$confirm" == "y" ]] || { echo "aborted"; exit 1; }

bsp consent grant "$BEO_ID" "$IEO_ID" \
  --intents "$INTENTS" \
  --categories "$CATEGORIES" \
  --days "$DAYS"

echo
echo "─── Verify tokens on your BEO ───"
bsp consent list "$BEO_ID"

echo
echo "Done. To revoke later:"
echo "  bsp consent revoke <tokenId> $BEO_ID"
echo "To emergency-revoke ALL tokens:"
echo "  bsp consent revoke-all $BEO_ID --confirm"
