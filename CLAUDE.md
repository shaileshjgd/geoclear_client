# @geoclear/client — Claude Code Project Instructions

> **Public npm package** — Typed TypeScript client for the GeoClear API.
> Repo: `shaileshjgd/geoclear_client` (PUBLIC — no secrets, no business logic)
> npm: `@geoclear/client` | org: `@geoclear` on npmjs.com

---

## ⚠️ CRITICAL — THIS IS A PUBLIC REPO

**Everything in this repo is publicly visible on GitHub and npm.**

- **NEVER commit secrets, API keys, tokens, internal docs, or business logic here.**
- **NEVER copy files from `sriharkaur/geoclear` except `src/api/openapi-app.ts`.**
- **NEVER push to this repo without explicit user approval.** Add a COMMS.md entry in the private repo and ask first.

---

## REPO PURPOSE

This repo contains ONE thing: the `@geoclear/client` npm package.

It is a typed TypeScript wrapper that lets consumers of the GeoClear API get:
- Full autocomplete on every endpoint, param, and response field
- 12 named response types (`AddressResult`, `RiskResult`, etc.)
- `hc<AppType>` Hono RPC client (types currently `any` — tracked as Q-163b)

**This repo has NO business logic. It is a thin type-export layer.**

---

## STRUCTURE

```
geoclear_client/
├── src/
│   ├── index.ts          ← re-exports hc + all named types
│   └── openapi-app.ts    ← source of truth for all client types (edit here directly)
├── dist/                 ← built output (gitignored, built by tsup)
├── tsup.config.ts        ← ESM + CJS + .d.ts build
├── tsconfig.json         ← standalone, no monorepo extends
├── package.json          ← @geoclear/client, version, exports map
└── .github/workflows/
    └── npm-publish.yml   ← tag-triggered npm publish via OIDC
```

---

## SOURCE OF TRUTH

**`src/openapi-app.ts` is edited directly in this repo.** This is the source of truth for all client types.

The private `sriharkaur/geoclear` repo has a parallel `src/api/openapi-app.ts` used for server-side OpenAPI spec generation. When the two need to stay in sync (e.g. after adding a new endpoint), copy from here to there:
```bash
cp ~/Projects/geoclear_client/src/openapi-app.ts ~/Projects/geoclear/src/api/openapi-app.ts
```

When releasing a new version:
1. Edit `src/openapi-app.ts` here directly
2. Bump version in `package.json`
3. `npm run build` — verify it compiles
4. `git add -A && git commit -m "feat: vX.Y.Z — description"`
5. `git tag vX.Y.Z && git push --tags` → GitHub Actions publishes to npm
   ⚠️ **Step 5 requires user approval — ask before pushing tags**

---

## COMMANDS

```bash
npm install          # install dev deps (hono, tsup, typescript, zod)
npm run build        # compile ESM + CJS + .d.ts → dist/
```

To publish a new version (requires user approval first):
```bash
# 1. Bump version in package.json
# 2. npm run build  (verify it compiles)
# 3. git add -A && git commit -m "feat: vX.Y.Z — description"
# 4. git tag vX.Y.Z && git push --tags
# GitHub Actions handles npm publish automatically via OIDC Trusted Publishing
```

---

## GITHUB + NPM ACCOUNTS

| Resource | Account |
|----------|---------|
| GitHub repo | `shaileshjgd` (personal public account) |
| npm package | `@geoclear` org, published by `shaileshjgd` |
| GitHub token | `$GITHUB_TOKEN_SHAILESHJGD` in `~/.zshrc` |
| npm token | `$NPM_TOKEN` in `~/.zshrc` (2FA-bypass granular token) |

**Token `$GITHUB_TOKEN_SHAILESHJGD` must only be used for this repo — never for the private `sriharkaur/geoclear` repo.**

---

## WHAT NOT TO DO

- Do not add API handlers, DB queries, or server logic
- Do not import from the private geoclear repo (no relative `../` paths to `sriharkaur/geoclear`)
- Do not add QUEUE.md, FEATURES.md, or internal planning docs
- Do not push without user approval — this is a public repo, every commit is visible
