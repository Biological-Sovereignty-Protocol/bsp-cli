[![npm version](https://img.shields.io/npm/v/@bsp/cli.svg)](https://www.npmjs.com/package/@bsp/cli)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)
[![BSP](https://img.shields.io/badge/BSP-v0.2_Protocol-0066CC.svg)](https://biologicalsovereigntyprotocol.com)
[![Built on Arweave](https://img.shields.io/badge/Permanent_Storage-Arweave-222222.svg)](https://arweave.org)

<br />

# @bsp/cli

Official command-line interface for the [Biological Sovereignty Protocol](https://biologicalsovereigntyprotocol.com).

Create and manage biological identities (BEOs), institutional entities (IEOs), consent tokens, and health data — directly from the terminal. 22 commands covering the full protocol lifecycle.

> Your biology, your keys, your terminal.

---

## Installation

```bash
npm install -g @bsp/cli
```

Or run without installing:

```bash
npx @bsp/cli --help
```

Requires Node.js >= 18.

---

## Quick Start

```bash
# 1. Configure the network
bsp config set network testnet

# 2. Create your biological identity
bsp create andre.bsp
# ✓ BEO created: andre.bsp
#
#   Domain       andre.bsp
#   BEO ID       tx_abc123...
#   Public Key   7f3a8b2c...
#
# ⚠️ CRITICAL — Store these securely. They are shown ONCE.
#
#   Private Key: 4e8f...128chars...
#   Seed:        a7b3...64chars...

# 3. Save your private key
bsp config set private-key 4e8f...

# 4. Verify on-chain
bsp resolve andre.bsp
# ✓ BEO found: andre.bsp
#
#   BEO ID       tx_abc123...
#   Status       ACTIVE
#   Key Version  1
#   Created      2026-04-07T20:00:00Z
```

---

## Commands

### Identity (BEO)

| Command | Description |
|---------|-------------|
| `bsp create <domain>` | Create a new BEO — generates Ed25519 keypair locally |
| `bsp resolve <domain>` | Look up a BEO by its .bsp domain |
| `bsp lock <beoId>` | Emergency lock — freezes all operations |
| `bsp unlock <beoId>` | Unlock a locked BEO |
| `bsp rotate-key <beoId>` | Rotate Ed25519 key (generates new keypair) |
| `bsp destroy <beoId> --confirm` | **IRREVERSIBLE** — Permanent erasure (LGPD/GDPR) |

#### Destroy — Sovereign Cryptographic Erasure

```bash
bsp destroy <beoId> --confirm
```

What happens on-chain:
1. Public key nullified (cryptographic erasure)
2. All ConsentTokens revoked
3. `.bsp` domain released
4. Recovery config wiped
5. Status set to `DESTROYED` — no undo

This implements LGPD Art. 18 (Brazil) and GDPR Art. 17 (EU) right to erasure at the protocol level.

---

### Consent

| Command | Description |
|---------|-------------|
| `bsp consent grant <beoId> <ieoId>` | Issue a ConsentToken to an institution |
| `bsp consent revoke <tokenId> <beoId>` | Revoke a single token |
| `bsp consent revoke-all <beoId> --confirm` | Emergency — revoke ALL tokens |
| `bsp consent verify <tokenId>` | Check if a token is valid |
| `bsp consent list <domain>` | List all tokens for a BEO |

#### Grant consent with scope

```bash
bsp consent grant <beoId> <ieoId> \
  --intents SUBMIT_RECORD,READ_RECORDS \
  --categories BSP-LA,BSP-GL,BSP-HM \
  --days 365
```

| Flag | Required | Description |
|------|----------|-------------|
| `--intents <list>` | Yes | Comma-separated: `SUBMIT_RECORD`, `READ_RECORDS`, `ANALYZE_VITALITY`, `REQUEST_SCORE`, `EXPORT_DATA`, `SYNC_PROTOCOL` |
| `--categories <list>` | No | Comma-separated BSP categories (e.g. `BSP-LA,BSP-CV`) |
| `--days <n>` | No | Expiration in days (default: permanent) |

---

### Institution (IEO)

| Command | Description |
|---------|-------------|
| `bsp ieo create <domain>` | Register a new IEO on the protocol |
| `bsp ieo get <ieoId>` | Get IEO details by UUID |
| `bsp ieo list` | List IEOs with filters |
| `bsp ieo lock <ieoId>` | Emergency lock |
| `bsp ieo unlock <ieoId>` | Unlock |
| `bsp ieo destroy <ieoId> --confirm` | **IRREVERSIBLE** — Destroy IEO |

```bash
bsp ieo create fleury.bsp --type LAB --name "Fleury Laboratórios"
bsp ieo list --type LAB --status ACTIVE --cert ADVANCED
```

IEO types: `LAB`, `HOSPITAL`, `WEARABLE`, `PHYSICIAN`, `INSURER`, `RESEARCH`, `PLATFORM`

---

### Health Data (Exchange)

| Command | Description |
|---------|-------------|
| `bsp records submit <beoId>` | Submit BioRecords from a JSON file |
| `bsp records read <beoId>` | Read BioRecords with filters |
| `bsp export <beoId>` | Sovereign data export (GDPR Art. 20 portability) |

```bash
# Submit lab results
bsp records submit <beoId> --token <tokenId> --file results.json

# Read with filters
bsp records read <beoId> --token <tokenId> --categories BSP-LA,BSP-CV --json

# Export everything in FHIR R4 format
bsp export <beoId> --token <tokenId> --format FHIR_R4 > my-health-data.json
```

Export formats: `JSON`, `CSV`, `FHIR_R4`

---

### Configuration

| Command | Description |
|---------|-------------|
| `bsp config set <key> <value>` | Set a config value |
| `bsp config get <key>` | Read a config value |
| `bsp config show` | Show all configuration |
| `bsp config path` | Print config file path |

```bash
bsp config set registry https://api.biologicalsovereigntyprotocol.com
bsp config set network testnet          # mainnet | testnet | local
bsp config set private-key <hex>
bsp config set ieo-domain fleury.bsp
```

Config stored at `~/.bsp/config.json`.

| Key | Default | Description |
|-----|---------|-------------|
| `registry` | `https://api.biologicalsovereigntyprotocol.com` | Registry API URL |
| `network` | `testnet` | Target network |
| `private-key` | — | Ed25519 private key (128 hex chars) |
| `ieo-domain` | — | Your IEO domain (for institutional commands) |

---

## Architecture

```
┌──────────────┐    signed payload    ┌──────────────────┐    Arweave TX    ┌──────────┐
│              │ ──────────────────→  │                  │ ──────────────→  │          │
│   bsp CLI    │    Ed25519 sig       │  Registry API    │    pays gas      │ Arweave  │
│   (local)    │                      │  (gasless relay)  │                  │ (on-chain)│
│              │ ←──────────────────  │                  │ ←──────────────  │          │
└──────────────┘    JSON response     └──────────────────┘    state read    └──────────┘
       ↑
       │ @bsp/sdk
       │ Ed25519 signing
       │ type definitions
```

- **Keys never leave your machine** — all cryptographic operations happen locally
- **The relayer is a gas payer, not an authority** — it cannot forge or modify your actions
- **Smart contracts verify every signature on-chain** — even a compromised relayer cannot cheat

---

## Complete Example — Lab Integration

```bash
# ── Institution setup (done once) ────────────────────────────────
bsp ieo create sunrise-lab.bsp --type LAB --name "Sunrise Diagnostics"
# Store the private key securely
bsp config set private-key <lab-private-key>
bsp config set ieo-domain sunrise-lab.bsp

# ── Patient creates identity ─────────────────────────────────────
bsp create andre.bsp
# Patient stores their private key

# ── Patient grants consent to the lab ────────────────────────────
bsp config set private-key <patient-private-key>
bsp consent grant <patientBeoId> <labIeoId> \
  --intents SUBMIT_RECORD,READ_RECORDS \
  --categories BSP-LA,BSP-GL,BSP-HM \
  --days 365

# ── Lab submits results ──────────────────────────────────────────
bsp config set private-key <lab-private-key>
bsp records submit <patientBeoId> \
  --token <consentTokenId> \
  --file blood-test-results.json

# ── Patient reads their data ─────────────────────────────────────
bsp config set private-key <patient-private-key>
bsp records read <patientBeoId> --token <consentTokenId> --json

# ── Patient exports for another doctor ───────────────────────────
bsp export <patientBeoId> --token <consentTokenId> --format FHIR_R4

# ── Patient revokes access ───────────────────────────────────────
bsp consent revoke <consentTokenId> <patientBeoId>

# ── Emergency: lock everything ───────────────────────────────────
bsp lock <patientBeoId>
bsp consent revoke-all <patientBeoId> --confirm
```

---

## Security

| Property | Implementation |
|----------|---------------|
| **Key storage** | `~/.bsp/config.json` — local, never transmitted |
| **Signing** | Ed25519 via `@bsp/sdk` (tweetnacl) — deterministic, auditable |
| **Transport** | Only signed payloads cross the network |
| **Replay protection** | Nonce (16+ chars) + timestamp (max 5 min) on every request |
| **Destructive ops** | `--confirm` flag required — no accidental erasure |
| **LGPD/GDPR** | `destroy` implements cryptographic erasure at protocol level |

---

## Error Handling

The CLI prints human-readable errors and exits with code 1 on failure:

```
✗ BEO not found
✗ Invalid Ed25519 signature
✗ nonce already used — replay detected
✗ request timestamp is too old (max 5 minutes)
✗ No private key configured. Run: bsp config set private-key <hex>
```

---

## Related Packages

| Package | Description |
|---------|-------------|
| [@bsp/sdk](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-typescript) | TypeScript SDK — programmatic access |
| [bsp-sdk-python](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-python) | Python SDK |
| [@bsp/mcp](https://github.com/Biological-Sovereignty-Protocol/bsp-mcp) | MCP server — connect AI agents to BSP |
| [bsp-id-web](https://github.com/Biological-Sovereignty-Protocol/bsp-id-web) | Web identity app |
| [bsp-spec](https://github.com/Biological-Sovereignty-Protocol/bsp-spec) | Protocol specification |
| [bsp-docs](https://github.com/Biological-Sovereignty-Protocol/bsp-docs) | Documentation |

---

## Contributing

```bash
git clone https://github.com/Biological-Sovereignty-Protocol/bsp-cli
cd bsp-cli
npm install
npm run build
node dist/index.js --help
```

---

## License

Apache 2.0 — [Ambrósio Institute](https://ambrosioinstitute.org)

Docs: [biologicalsovereigntyprotocol.com/developers/cli](https://biologicalsovereigntyprotocol.com/developers/cli) · Protocol: [bsp-spec](https://github.com/Biological-Sovereignty-Protocol/bsp-spec)
