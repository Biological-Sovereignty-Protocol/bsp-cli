# Changelog

All notable changes to `bspctl` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `examples/` directory with runnable bash scripts for the three core flows:
  - `create-beo.sh` — bootstrap a sovereign biological identity
  - `grant-consent.sh` — issue a ConsentToken to an IEO
  - `submit-biorecord.sh` — submit measurements with scoped consent
- `CONTRIBUTING.md` with dev setup, testing, and PR guidelines
- Expanded README with per-command reference tables and flag documentation

### Changed
- Documentation consolidated with cross-links to bsp-spec glossary and error catalog

---

## [0.2.0] — 2026-04

### Added
- Full 22-command coverage: BEO, IEO, Consent, Exchange, Config
- `bsp destroy` — cryptographic erasure (LGPD Art. 18 / GDPR Art. 17)
- `bsp consent revoke-all` — emergency revocation
- `bsp export` — FHIR R4 / JSON / CSV portability (GDPR Art. 20)
- `bsp rotate-key` — rotate Ed25519 key
- `bsp ieo create|get|list|lock|unlock|destroy` — institutional lifecycle
- `bsp lock` / `bsp unlock` — BEO-level emergency freeze
- Structured error output with stable codes (see `bsp-spec/docs/ERROR_CODES.md`)
- Nonce + timestamp replay protection on all signed payloads

### Security
- All Ed25519 operations happen locally — private key never transmitted
- `--confirm` flag required for destructive operations
- Max request timestamp age: 5 minutes
- Minimum nonce length: 16 characters

---

## [0.1.0] — 2026-03

### Added
- Initial CLI with `create`, `resolve`, `consent grant`, `consent revoke`
- Configuration at `~/.bsp/config.json`
- Testnet + mainnet support
- Published to npm as `bspctl`

---

## Links

- **Protocol spec:** [bsp-spec](https://github.com/Biological-Sovereignty-Protocol/bsp-spec)
- **SDK:** [bsp-sdk-typescript](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-typescript)
- **Issues:** [github.com/.../bsp-cli/issues](https://github.com/Biological-Sovereignty-Protocol/bsp-cli/issues)
