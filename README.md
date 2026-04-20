[![npm version](https://img.shields.io/npm/v/bspctl.svg)](https://www.npmjs.com/package/bspctl)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green.svg)](https://nodejs.org)
[![BSP](https://img.shields.io/badge/BSP-v0.2_Protocol-0066CC.svg)](https://biologicalsovereigntyprotocol.com)
[![Built on Aptos](https://img.shields.io/badge/Built_on-Aptos-222222.svg)](https://aptoslabs.com)

<br />

# bspctl

Official command-line interface for the [Biological Sovereignty Protocol](https://biologicalsovereigntyprotocol.com).

Create and manage biological identities (BEOs), institutional entities (IEOs), consent tokens, and health data — directly from the terminal. 22 commands covering the full protocol lifecycle.

> Your biology, your keys, your terminal.

---

## Installation

```bash
npm install -g bspctl
```

### Shell completions

After installing, add completions to your shell:

```bash
# bash — add to ~/.bashrc
eval "$(bsp completions bash)"

# zsh — add to ~/.zshrc
eval "$(bsp completions zsh)"
```

Or run without installing:

```bash
npx bspctl --help
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
┌──────────────┐    signed payload    ┌──────────────────┐    Aptos TX     ┌──────────┐
│              │ ──────────────────→  │                  │ ──────────────→  │          │
│   bsp CLI    │    Ed25519 sig       │  Registry API    │    pays gas      │  Aptos   │
│   (local)    │                      │  (gasless relay)  │                  │ (on-chain)│
│              │ ←──────────────────  │                  │ ←──────────────  │          │
└──────────────┘    JSON response     └──────────────────┘    state read    └──────────┘
       ↑
       │ bsp-sdk
       │ Ed25519 signing
       │ type definitions
```

- **Keys never leave your machine** — all cryptographic operations happen locally
- **The relayer is a gas payer, not an authority** — it cannot forge or modify your actions
- **Move smart contracts verify every signature on-chain** — even a compromised relayer cannot cheat

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
| **Signing** | Ed25519 via `bsp-sdk` (tweetnacl) — deterministic, auditable |
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

## Command Reference — Detailed

Every command, every flag, every example. Reach for this when you want exhaustive detail.

### `bsp create <domain>`

Create a new BEO. Generates an Ed25519 keypair **locally** — the private key never leaves your machine.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `<domain>` | Yes | — | `.bsp` domain (e.g. `alice.bsp`) |
| `--json` | No | off | Emit output as JSON for scripting |

```bash
bsp create alice.bsp
bsp create alice.bsp --json > identity.json
```

### `bsp resolve <domain>`

Resolve a BEO by its `.bsp` domain. Reads on-chain state — no signature required.

```bash
bsp resolve alice.bsp
```

### `bsp lock <beoId>` / `bsp unlock <beoId>`

Emergency lock or unlock a BEO. Requires the holder's private key. Locked BEOs reject all operations until unlocked.

### `bsp rotate-key <beoId>`

Rotate the BEO's Ed25519 key. Increments `keyVersion`. Old signatures remain valid for past records.

### `bsp destroy <beoId> --confirm`

**IRREVERSIBLE.** Cryptographic erasure (LGPD Art. 18 / GDPR Art. 17). `--confirm` flag is mandatory.

| Flag | Required | Description |
|------|----------|-------------|
| `<beoId>` | Yes | Target BEO |
| `--confirm` | Yes | Explicit confirmation — prevents accidental erasure |

### `bsp consent grant <beoId> <ieoId>`

Issue a ConsentToken to an institution.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--intents <list>` | Yes | — | Comma-separated: `SUBMIT_RECORD`, `READ_RECORDS`, `ANALYZE_VITALITY`, `REQUEST_SCORE`, `EXPORT_DATA`, `SYNC_PROTOCOL` |
| `--categories <list>` | No | all | Comma-separated BSP categories (e.g. `BSP-LA,BSP-CV`) |
| `--days <n>` | No | permanent | Expiration in days |

```bash
bsp consent grant <beoId> <ieoId> \
  --intents SUBMIT_RECORD,READ_RECORDS \
  --categories BSP-LA,BSP-GL,BSP-HM \
  --days 365
```

### `bsp consent revoke <tokenId> <beoId>`

Revoke a single token. Effect is immediate on-chain.

### `bsp consent revoke-all <beoId> --confirm`

Revoke **every** active ConsentToken for a BEO. Use in emergency (lost device, compromised identity).

### `bsp consent verify <tokenId>`

Check if a token is valid — returns status (active / revoked / expired), intents, categories, expiry.

### `bsp consent list <domain>`

List all tokens for a BEO. Supports `--json`.

### `bsp ieo create <domain>`

Register a new IEO on the protocol.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `<domain>` | Yes | — | Institution `.bsp` domain (e.g. `fleury.bsp`) |
| `--type <type>` | Yes | — | `LAB` \| `HOSPITAL` \| `WEARABLE` \| `PHYSICIAN` \| `INSURER` \| `RESEARCH` \| `PLATFORM` |
| `--name <str>` | Yes | — | Human-readable institution name |

### `bsp ieo get <ieoId>` / `bsp ieo list`

Retrieve IEO details or list IEOs. `list` supports filters: `--type`, `--status`, `--cert`.

### `bsp ieo lock|unlock|destroy`

Lifecycle operations on an IEO. `destroy` requires `--confirm`.

### `bsp records submit <beoId>`

Submit BioRecords from a JSON file. Signed by the IEO.

| Flag | Required | Description |
|------|----------|-------------|
| `--token <tokenId>` | Yes | Active ConsentToken with `SUBMIT_RECORD` intent |
| `--file <path>` | Yes | JSON file containing an array of BioRecord payloads |

### `bsp records read <beoId>`

Read BioRecords with filters.

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token <tokenId>` | Yes | — | ConsentToken with `READ_RECORDS` intent |
| `--categories <list>` | No | all | Comma-separated category codes |
| `--from <date>` | No | — | ISO 8601 start date |
| `--to <date>` | No | — | ISO 8601 end date |
| `--json` | No | off | JSON output |

### `bsp export <beoId>`

Sovereign data export (GDPR Art. 20).

| Flag | Required | Default | Description |
|------|----------|---------|-------------|
| `--token <tokenId>` | Yes | — | Token with `EXPORT_DATA` intent |
| `--format <fmt>` | No | `JSON` | `JSON` \| `CSV` \| `FHIR_R4` |

### `bsp config set|get|show|path`

Manage the config at `~/.bsp/config.json`. See the `Configuration` section above for recognized keys.

---

## Examples

Runnable bash scripts in [`examples/`](./examples):

- [`examples/create-beo.sh`](./examples/create-beo.sh) — bootstrap a sovereign biological identity
- [`examples/grant-consent.sh`](./examples/grant-consent.sh) — issue a ConsentToken to an IEO
- [`examples/submit-biorecord.sh`](./examples/submit-biorecord.sh) — submit measurements with scoped consent

---

## Changelog

See [`CHANGELOG.md`](./CHANGELOG.md).

## Related Packages

| Package | Description |
|---------|-------------|
| [bsp-sdk](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-typescript) | TypeScript SDK — programmatic access |
| [bsp-sdk-python](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-python) | Python SDK |
| [bsp-mcp](https://github.com/Biological-Sovereignty-Protocol/bsp-mcp) | MCP server — connect AI agents to BSP |
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
