# Contributing to bspctl

Thank you for helping make the Biological Sovereignty Protocol better. `bspctl` is the official command-line interface for BSP, so every change here reaches every developer, every terminal, every sovereign identity.

This document is the fastest path from "I want to contribute" to "my PR is merged".

---

## Before you start

- **Read the spec** — `bsp-spec` defines the protocol. Every CLI command maps to a spec operation. If behavior disagrees with the spec, the spec wins.
- **Check existing issues** — someone may already be working on it.
- **Open an issue first** — for non-trivial changes, align on approach before you code.

---

## Development setup

```bash
git clone https://github.com/Biological-Sovereignty-Protocol/bsp-cli
cd bsp-cli
npm install
npm run build
node dist/index.js --help
```

Requires Node.js >= 18.

### Local testing

```bash
# Link the CLI globally for live testing
npm link
bsp --help

# When done
npm unlink
```

### Running against testnet

```bash
bsp config set network testnet
bsp config set registry https://api-testnet.biologicalsovereigntyprotocol.com
```

Never test destructive operations (`destroy`, `revoke-all`) against mainnet.

---

## Pull request checklist

Before you open a PR:

- [ ] `npm run build` passes with no TypeScript errors
- [ ] Commands added / changed are documented in `README.md` (commands table + example)
- [ ] `CHANGELOG.md` updated under `[Unreleased]`
- [ ] New error conditions map to a code in `bsp-spec/docs/ERROR_CODES.md` (add one if needed, cross-link the PR)
- [ ] Destructive operations require `--confirm`
- [ ] No private keys, tokens, or identifiable data in test fixtures
- [ ] PR description explains **why** the change is needed, not only what it does

---

## Coding style

- **TypeScript strict mode** — no `any` unless unavoidable and commented
- **No cacoete de IA** — frases curtas, sem ponto-e-vírgula decorativo, sem "é importante notar que"
- **Error messages** — human-readable on stderr, exit code 1 on failure, include actionable next step
- **Success output** — prefix with `✓`, errors with `✗`, warnings with `⚠️`
- **No colors when piped** — respect `process.stdout.isTTY`
- **JSON mode** — any command showing data MUST support `--json` for scripting

---

## Commit messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(consent): add --dry-run to consent grant
fix(beo): handle BEO_DESTROYED gracefully on resolve
docs(readme): clarify private-key storage warning
chore(deps): bump @bsp/sdk to 0.3.1
```

Scope is the command group: `beo`, `ieo`, `consent`, `exchange`, `config`, or `cli` for cross-cutting.

---

## Adding a new command

1. Create `src/commands/<group>.ts` (or extend existing) with the Commander definition
2. Wire it into `src/index.ts`
3. Add a row to the relevant command table in `README.md`
4. Document every flag (required / optional / default)
5. Add an example invocation
6. Add a `CHANGELOG.md` entry under `[Unreleased]`
7. If the command needs a new error code, coordinate with `bsp-spec/docs/ERROR_CODES.md` in the same PR

---

## Security

- **Keys are sacred.** Any code path that touches the private key must be reviewed by a maintainer before merge.
- **Never log the private key** — not even at `--debug` level.
- **No phone-home telemetry** — the CLI must work air-gapped.
- **Report vulnerabilities privately** — see `SECURITY.md`.

---

## Release

Maintainers only:

```bash
# 1. Bump version in package.json
# 2. Move [Unreleased] → new version in CHANGELOG.md
# 3. Tag
git tag v0.3.0
git push --tags

# 4. Publish
npm publish
```

---

## License

By contributing, you agree that your contributions are licensed under Apache 2.0.

## Related

- **Protocol spec:** [bsp-spec](https://github.com/Biological-Sovereignty-Protocol/bsp-spec)
- **SDK:** [bsp-sdk-typescript](https://github.com/Biological-Sovereignty-Protocol/bsp-sdk-typescript)
- **Security policy:** [`SECURITY.md`](./SECURITY.md)
