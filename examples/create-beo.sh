#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# BSP CLI — Create a Biological Entity Object (BEO)
# ──────────────────────────────────────────────────────────────
# This script walks through creating a sovereign biological
# identity on BSP. Keys are generated locally and never leave
# your machine.
#
# Usage:  ./create-beo.sh <your-domain>
# Example: ./create-beo.sh alice.bsp
# ──────────────────────────────────────────────────────────────

set -euo pipefail

DOMAIN="${1:-}"

if [[ -z "$DOMAIN" ]]; then
  echo "usage: $0 <domain>"
  echo "example: $0 alice.bsp"
  exit 1
fi

if [[ ! "$DOMAIN" =~ \.bsp$ ]]; then
  echo "error: domain must end in .bsp (got: $DOMAIN)"
  exit 1
fi

echo "─── 1. Configure network ───"
bsp config set network testnet

echo
echo "─── 2. Create BEO for $DOMAIN ───"
echo "Note: private key + seed will be shown ONCE. Store them offline."
bsp create "$DOMAIN"

echo
echo "─── 3. After you save the private key, set it in config ───"
echo "run: bsp config set private-key <your-128-hex-chars>"

echo
echo "─── 4. Verify your BEO exists on-chain ───"
read -rp "Press Enter once you have saved the key and set it in config..."
bsp resolve "$DOMAIN"

echo
echo "Done. Your sovereign biological identity is live."
echo "Domain: $DOMAIN"
echo "Next steps:"
echo "  - Grant consent to an IEO:   see ./grant-consent.sh"
echo "  - Submit biological records: see ./submit-biorecord.sh"
