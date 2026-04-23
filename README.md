# @geoclear/client

Typed TypeScript client for [GeoClear](https://geoclear.io) — **address intelligence built for the agents that call it**. 198M US locations, 15+ fields per call, MCP-native, with optional per-decision USDC payment via x402 on Base. For humans writing code and for software that buys without asking one.

Full autocomplete on every endpoint, request param, and response field.

## See it in action

<p align="center">
  <img src="https://geoclear.io/assets/curl-15s.svg"
       alt="GeoClear API returning a verified Washington DC address with flood zone, risk scores, drone deliverability, and a cryptographically signed receipt, in 15 seconds."
       width="720" />
</p>

One call. Verified address, compliance fields, risk scores, drone reachability, and a cryptographically signed receipt — all in the same JSON body. Every response carries an `X-GeoClear-Receipt` header you can verify offline with [`@geoclear/verify-receipt`](https://www.npmjs.com/package/@geoclear/verify-receipt).

> The animation above renders on GitHub + most markdown viewers. If you're reading this on npmjs.com and see a static frame, try the live demo at [geoclear.io](https://geoclear.io) — click "Search" in the Live demo card.

## Install

```bash
npm install @geoclear/client
```

## Usage

### Typed response shapes (recommended)

```ts
import type { AddressResult, RiskResult, EnrichResult } from '@geoclear/client';

const res = await fetch('https://geoclear.io/v1/address?street=...');
const data: AddressResult = await res.json();
```

### Hono RPC client

```ts
import { hc } from '@geoclear/client';
import type { AppType } from '@geoclear/client';

const client = hc<AppType>('https://geoclear.io', {
  headers: { 'X-API-Key': 'your-key' }
});
```

## Exported types

| Type | Endpoint |
|------|----------|
| `AddressResult` | `GET /v1/address` |
| `AddressListResponse` | `GET /v1/addresses` |
| `SuggestResponse` / `SuggestItem` | `GET /v1/suggest` |
| `BulkResponse` / `BulkItem` | `POST /v1/bulk` |
| `EnrichResult` | `GET /v1/enrich` |
| `RiskResult` | `GET /v1/risk` |
| `SignupResponse` | `POST /v1/auth/signup` |
| `MeResponse` | `GET /v1/auth/me` |
| `HealthResponse` | `GET /api/health` |
| `CoverageResponse` | `GET /v1/coverage` |

## Links

- [API docs](https://geoclear.io/docs)
- [geoclear.io](https://geoclear.io)
