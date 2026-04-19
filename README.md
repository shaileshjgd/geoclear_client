# @geoclear/client

Typed TypeScript client for the [GeoClear API](https://geoclear.io) — full autocomplete on every endpoint, request param, and response field.

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
