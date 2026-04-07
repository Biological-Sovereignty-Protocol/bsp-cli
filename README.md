# @bsp/cli

Official command-line interface for the **Biological Sovereignty Protocol**.

Create and manage biological identities (BEOs), institutional entities (IEOs), consent tokens, and health data — directly from the terminal.

## Install

```bash
npm install -g @bsp/cli
```

Or run without installing:

```bash
npx @bsp/cli --help
```

## Quick Start

```bash
# 1. Configure the network
bsp config set network testnet

# 2. Create your biological identity
bsp create andre.bsp
# → Generates Ed25519 keypair locally
# → Registers BEO on Arweave (gas paid by protocol relayer)
# → Returns private key + seed phrase — STORE SECURELY

# 3. Save your private key
bsp config set private-key <your-private-key-hex>

# 4. Check your BEO
bsp resolve andre.bsp
```

## Commands

### Identity (BEO)

```bash
bsp create <domain>              # Create a new BEO
bsp resolve <domain>             # Look up a BEO by domain
bsp lock <beoId>                 # Emergency lock
bsp unlock <beoId>               # Unlock
bsp rotate-key <beoId>           # Rotate Ed25519 key
bsp destroy <beoId> --confirm    # Permanent erasure (LGPD/GDPR)
```

### Consent

```bash
bsp consent grant <beoId> <ieoId> --intents SUBMIT_RECORD,READ_RECORDS --days 365
bsp consent revoke <tokenId> <beoId>
bsp consent revoke-all <beoId> --confirm
bsp consent verify <tokenId>
bsp consent list <domain>
```

### Institution (IEO)

```bash
bsp ieo create <domain> --type LAB --name "Fleury"
bsp ieo get <ieoId>
bsp ieo list --type LAB --status ACTIVE
bsp ieo lock <ieoId>
bsp ieo unlock <ieoId>
bsp ieo destroy <ieoId> --confirm
```

### Health Data (Exchange)

```bash
bsp records submit <beoId> --token <tokenId> --file records.json
bsp records read <beoId> --token <tokenId> --categories BSP-LA,BSP-CV
bsp records read <beoId> --token <tokenId> --json
bsp export <beoId> --token <tokenId> --format FHIR_R4
```

### Configuration

```bash
bsp config set registry https://api.biologicalsovereigntyprotocol.com
bsp config set network testnet          # mainnet | testnet | local
bsp config set private-key <hex>
bsp config set ieo-domain fleury.bsp
bsp config show
bsp config path
```

## Configuration

Config is stored at `~/.bsp/config.json`. The CLI reads from this file for every command.

| Key | Default | Description |
|-----|---------|-------------|
| `registry` | `https://api.biologicalsovereigntyprotocol.com` | Registry API URL |
| `network` | `testnet` | Network: mainnet, testnet, local |
| `private-key` | — | Ed25519 private key (hex) |
| `ieo-domain` | — | Your IEO domain (for institutional commands) |

## Security

- Private keys are stored in `~/.bsp/config.json` with file-level permissions
- Keys never leave your machine — all signing happens locally
- The registry API only receives signed payloads, never raw keys
- Destructive operations (`destroy`, `revoke-all`) require `--confirm`

## Architecture

```
┌──────────┐    signed payload    ┌──────────────┐    Arweave TX    ┌──────────┐
│  bsp CLI │ ──────────────────→  │ Registry API │ ──────────────→  │ Arweave  │
│  (local) │    Ed25519 sig       │  (relayer)   │    pays gas      │ (on-chain│
└──────────┘                      └──────────────┘                  └──────────┘
     ↑
     │ uses @bsp/sdk
     │ for crypto + types
```

The CLI uses `@bsp/sdk` for Ed25519 key generation, payload signing, and type definitions. The registry API acts as a gasless relayer — it pays Arweave transaction fees but cannot forge user actions (all operations are verified on-chain by the smart contract).

## Examples

### Create a BEO and grant consent to a lab

```bash
# Create identity
bsp create andre.bsp
# Output: BEO ID, private key, seed phrase

# Configure key
bsp config set private-key abc123...

# Grant read access to a lab for 1 year
bsp consent grant <beoId> <labIeoId> \
  --intents SUBMIT_RECORD,READ_RECORDS \
  --categories BSP-LA,BSP-GL,BSP-HM \
  --days 365

# Check what tokens exist
bsp consent list andre.bsp

# Revoke a specific token
bsp consent revoke <tokenId> <beoId>
```

### Export health data (GDPR portability)

```bash
bsp export <beoId> --token <tokenId> --format FHIR_R4 > my-health-data.json
```

### Emergency: lock everything

```bash
bsp lock <beoId>
bsp consent revoke-all <beoId> --confirm
```

### Nuclear option: delete identity (LGPD erasure)

```bash
bsp destroy <beoId> --confirm
# Public key nullified, all tokens revoked, domain released
# This cannot be undone
```

## Related

- [@bsp/sdk](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-typescript) — TypeScript SDK
- [bsp-sdk-python](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-python) — Python SDK
- [@bsp/mcp](https://github.com/Biological-Sovereignty-Protocol/bsp-mcp) — MCP server for AI agents
- [bsp-id-web](https://github.com/Biological-Sovereignty-Protocol/bsp-id-web) — Web identity app
- [bsp-spec](https://github.com/Biological-Sovereignty-Protocol/bsp-spec) — Protocol specification

## License

Apache 2.0 — [Ambrósio Institute](https://ambrosioinstitute.org)
