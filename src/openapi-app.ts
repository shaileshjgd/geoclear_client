/**
 * openapi-app.ts — TypeScript source for two consumers:
 *  1. openapi-app.js (server, CommonJS) — compiled from this file, generates /openapi.json
 *  2. @geoclear/client (npm package) — imports AppType for hc<AppType> type inference
 *
 * Route definitions here are the single source of truth for:
 *  - OpenAPI spec (getOpenAPIDocument)
 *  - Client type inference (AppType = typeof app)
 *  - Input validation shapes (z.infer<typeof QuerySchema>)
 *
 * Last validated: 2026-04-19
 */
import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import { z } from '@hono/zod-openapi';

type SecurityReq = { [key: string]: string[] }[];

// ── Schemas (inlined so this file is self-contained for the npm client) ──

const Err = z.object({ ok: z.boolean(), error: z.string() }).openapi('Error');

const AddressResult = z.object({
  address_id:   z.string().openapi({ example: 'a1b2c3d4-0000-0000-0000-000000000000', description: 'Stable address record identifier (UUID)' }),
  authority:    z.string().nullish().openapi({ example: 'DCRA', description: 'Authoritative source that recorded the address' }),
  updated_at:   z.string().nullish().openapi({ example: '2024-12-31T12:40:45Z', description: 'ISO-8601 UTC timestamp of last record update' }),
  full_address: z.string().openapi({ example: '1600 PENNSYLVANIA AVE NW, WASHINGTON, DC 20500' }),
  add_number:   z.string().openapi({ example: '1600' }),
  st_name:      z.string().openapi({ example: 'PENNSYLVANIA AVE NW' }),
  st_pos_typ:   z.string().nullish(),
  inc_muni:     z.string().nullish().openapi({ example: 'WASHINGTON' }),
  post_city:    z.string().nullish(),
  display_city: z.string().nullish().openapi({ example: 'Washington' }),
  county:       z.string().nullish(),
  state:        z.string().openapi({ example: 'DC' }),
  zip_code:     z.string().nullish().openapi({ example: '20500' }),
  latitude:     z.number().nullish().openapi({ example: 38.8977 }),
  longitude:    z.number().nullish().openapi({ example: -77.0365 }),
  confidence:   z.number().openapi({ example: 95 }),
  match_type:   z.enum(['exact', 'number+street', 'street+location', 'street', 'location']),
  fips:         z.string().nullish().openapi({ example: '11001' }),
  timezone:     z.string().nullish().openapi({ example: 'America/New_York' }),
  residential:  z.string().nullish(),
}).openapi('AddressResult');

const AddressList = z.object({
  ok: z.boolean(), count: z.number(), data: z.array(AddressResult),
}).openapi('AddressListResponse');

const SuggestItem = z.object({
  full_address: z.string(), inc_muni: z.string().nullish(),
  post_city: z.string().nullish(), state: z.string(), zip_code: z.string().nullish(),
}).openapi('SuggestItem');

const SuggestResponse = z.object({
  ok: z.boolean(), count: z.number(), data: z.array(SuggestItem),
}).openapi('SuggestResponse');

const BulkItem = z.object({
  street: z.string().openapi({ example: '1600 Pennsylvania Ave NW' }),
  number: z.string().optional(), city: z.string().optional(),
  state:  z.string().optional(), zip: z.string().optional(),
}).openapi('BulkItem');

const BulkResponse = z.object({
  ok: z.boolean(), count: z.number(),
  data: z.array(z.union([AddressResult, z.object({ verified: z.literal(false) })])),
}).openapi('BulkResponse');

const EnrichResult = z.object({
  fips:            z.string().nullish(),
  timezone:        z.string().nullish(),
  flood_zone:      z.string().nullish().openapi({ example: 'X' }),
  flood_zone_desc: z.string().nullish(),
  flood_sfha:      z.boolean().nullish(),
  elevation_ft:    z.number().nullish(),
  wildfire_risk:   z.string().nullish(),
  wildfire_score:  z.number().nullish(),
  earthquake_risk: z.string().nullish(),
  drought_risk:    z.string().nullish(),
  nri_risk:        z.string().nullish(),
}).openapi('EnrichResult');

const FloodData = z.object({
  zone: z.string().nullish(), description: z.string().nullish(),
  in_sfha: z.boolean().nullish(), panel_number: z.string().nullish(),
  effective_date: z.string().nullish(),
}).openapi('FloodData');

const RiskResult = z.object({
  ok: z.boolean(), address_id: z.string().nullish(), address: z.string().nullish(),
  latitude: z.number().nullish(), longitude: z.number().nullish(),
  flood: FloodData.nullish(),
  wildfire:   z.object({ risk_class: z.string().nullish(), score: z.number().nullish(), percentile: z.number().nullish() }).nullish(),
  earthquake: z.object({ risk_class: z.string().nullish(), pga: z.number().nullish() }).nullish(),
  drought:    z.object({ risk_class: z.string().nullish() }).nullish(),
  nri:        z.object({ risk_rating: z.string().nullish(), composite_score: z.number().nullish() }).nullish(),
}).openapi('RiskResult');

const Limits = z.object({
  req_per_day: z.number(), req_per_min: z.number(), enrichment: z.boolean(),
}).openapi('Limits');

const SignupResponse = z.object({
  ok: z.boolean(),
  data: z.object({ api_key: z.string(), tier: z.string(), email: z.string(), limits: Limits }),
}).openapi('SignupResponse');

const MeResponse = z.object({
  ok: z.boolean(),
  data: z.object({
    tier: z.string(), email: z.string(), limits: Limits,
    requests_today: z.number(), requests_total: z.number(),
    created_at: z.string().nullish(),
    usage_history: z.array(z.object({ date: z.string(), count: z.number() })),
  }),
}).openapi('MeResponse');

const HealthResponse = z.object({
  ok: z.boolean(), status: z.string(),
  addresses: z.number(), uptime: z.number(),
}).openapi('HealthResponse');

const CoverageResponse = z.object({
  ok: z.boolean(), count: z.number(),
  data: z.array(z.object({ state: z.string(), count: z.number() })),
}).openapi('CoverageResponse');

const AddressQuery = z.object({
  street: z.string().optional().openapi({ example: '1600 Pennsylvania Ave NW' }),
  number: z.string().optional(), city: z.string().optional(),
  state:  z.string().optional().openapi({ example: 'DC' }),
  zip:    z.string().optional(), limit: z.string().optional(), fuzzy: z.string().optional(),
});

const NearQuery = z.object({
  lat: z.string().openapi({ example: '38.8977' }),
  lon: z.string().openapi({ example: '-77.0365' }),
  radius: z.string().optional(), limit: z.string().optional(),
});

const PointQuery = z.object({
  lat: z.string().openapi({ example: '38.8977' }),
  lon: z.string().openapi({ example: '-77.0365' }),
});

const RiskQuery = z.object({
  street: z.string().optional(), city: z.string().optional(),
  state: z.string().optional(), zip: z.string().optional(),
  address_id: z.string().optional(),
});

// ── App ───────────────────────────────────────────────────────────

const _base = new OpenAPIHono();

// ── Security ──────────────────────────────────────────────────────
_base.openAPIRegistry.registerComponent('securitySchemes', 'ApiKey', {
  type: 'apiKey',
  in: 'header',
  name: 'X-Api-Key',
  description: 'Your GeoClear API key. Get one free at https://geoclear.io/portal.html',
});

// ── Helpers ───────────────────────────────────────────────────────
const auth = { security: [{ ApiKey: [] }] as SecurityReq };
const open = { security: [] as SecurityReq };

const errResponses = {
  400: { content: { 'application/json': { schema: Err } }, description: 'Bad request' },
  401: { content: { 'application/json': { schema: Err } }, description: 'Invalid or missing API key' },
  404: { content: { 'application/json': { schema: Err } }, description: 'Not found' },
  429: { content: { 'application/json': { schema: Err } }, description: 'Rate limit exceeded' },
} as const;

// ── Health ────────────────────────────────────────────────────────

const healthRoute = createRoute({
  ...open, method: 'get', path: '/api/health',
  tags: ['Health'], summary: 'Health check', operationId: 'getHealth',
  responses: { 200: { content: { 'application/json': { schema: HealthResponse } }, description: 'Service healthy' } },
});

const pingRoute = createRoute({
  ...open, method: 'get', path: '/api/ping',
  tags: ['Health'], summary: 'Ping', operationId: 'ping',
  responses: { 200: { content: { 'application/json': { schema: z.object({ ok: z.boolean() }) } }, description: 'Pong' } },
});

// ── Address ───────────────────────────────────────────────────────

const addressRoute = createRoute({
  ...auth, method: 'get', path: '/api/address',
  tags: ['Address'], summary: 'Lookup an address',
  description: 'Returns a verified, normalized address record. Flood/risk fields are NOT included — use /api/enrich or /v1/address/risk.',
  operationId: 'lookupAddress',
  request: { query: AddressQuery },
  responses: { 200: { content: { 'application/json': { schema: AddressList } }, description: 'Address results' }, ...errResponses },
});

const suggestRoute = createRoute({
  ...auth, method: 'get', path: '/api/suggest',
  tags: ['Address'], summary: 'Autocomplete suggestions', operationId: 'suggestAddress',
  request: {
    query: z.object({
      q:     z.string().openapi({ example: '1600 Penn' }),
      state: z.string().optional(), zip: z.string().optional(), limit: z.string().optional(),
    }),
  },
  responses: { 200: { content: { 'application/json': { schema: SuggestResponse } }, description: 'Suggestions' }, ...errResponses },
});

const bulkRoute = createRoute({
  ...auth, method: 'post', path: '/api/address/bulk',
  tags: ['Address'], summary: 'Bulk address lookup (JSON)', operationId: 'bulkLookup',
  request: { body: { required: true, content: { 'application/json': { schema: z.array(BulkItem).max(1000) } } } },
  responses: { 200: { content: { 'application/json': { schema: BulkResponse } }, description: 'Bulk results' }, ...errResponses },
});

const bulkCsvRoute = createRoute({
  ...auth, method: 'post', path: '/api/address/csv',
  tags: ['Address'], summary: 'Bulk address lookup (CSV)', operationId: 'bulkLookupCsv',
  request: { body: { required: true, content: { 'text/csv': { schema: z.string() } } } },
  responses: { 200: { content: { 'text/csv': { schema: z.string() } }, description: 'Enriched CSV' }, ...errResponses },
});

const nearRoute = createRoute({
  ...auth, method: 'get', path: '/api/near',
  tags: ['Address'], summary: 'Nearby addresses', operationId: 'nearbyAddresses',
  request: { query: NearQuery },
  responses: { 200: { content: { 'application/json': { schema: AddressList } }, description: 'Nearby results' }, ...errResponses },
});

const zipRoute = createRoute({
  ...auth, method: 'get', path: '/api/zip/{zip}',
  tags: ['Address'], summary: 'ZIP code lookup', operationId: 'zipLookup',
  request: { params: z.object({ zip: z.string().regex(/^[0-9]{5}$/).openapi({ example: '90210' }) }) },
  responses: {
    200: { content: { 'application/json': { schema: z.object({ ok: z.boolean(), data: z.object({}).passthrough() }) } }, description: 'ZIP data' },
    ...errResponses,
  },
});

const coverageRoute = createRoute({
  ...auth, method: 'get', path: '/api/coverage',
  tags: ['Address'], summary: 'Coverage statistics', operationId: 'getCoverage',
  responses: { 200: { content: { 'application/json': { schema: CoverageResponse } }, description: 'Coverage data' }, ...errResponses },
});

const statsRoute = createRoute({
  ...auth, method: 'get', path: '/api/stats',
  tags: ['Address'], summary: 'Database statistics', operationId: 'getStats',
  responses: { 200: { content: { 'application/json': { schema: z.object({ ok: z.boolean(), data: z.object({}).passthrough() }) } }, description: 'Stats' }, ...errResponses },
});

// ── Enrich ────────────────────────────────────────────────────────

const enrichRoute = createRoute({
  ...auth, method: 'get', path: '/api/enrich',
  tags: ['Enrich'], summary: 'Enrich a lat/lon point',
  description: 'Returns flood zone, risk scores, census data, FAA airspace, and timezone.',
  operationId: 'enrichPoint',
  request: { query: PointQuery },
  responses: { 200: { content: { 'application/json': { schema: z.object({ ok: z.boolean(), data: EnrichResult }) } }, description: 'Enrichment data' }, ...errResponses },
});

const riskRoute = createRoute({
  ...auth, method: 'get', path: '/v1/address/risk',
  tags: ['Enrich'], summary: 'Full risk assessment for an address',
  description: 'FEMA flood zone (panel + SFHA), wildfire score, earthquake PGA, drought, and NRI composite.',
  operationId: 'addressRisk',
  request: { query: RiskQuery },
  responses: { 200: { content: { 'application/json': { schema: RiskResult } }, description: 'Risk assessment' }, ...errResponses },
});

// ── Account ───────────────────────────────────────────────────────

const signupRoute = createRoute({
  ...open, method: 'post', path: '/v1/signup',
  tags: ['Account'], summary: 'Get a free API key',
  description: 'Creates a free-tier key (10K lookups/month). No credit card required.',
  operationId: 'signup',
  request: {
    body: {
      required: true,
      content: { 'application/json': { schema: z.object({ email: z.string().email().openapi({ example: 'dev@example.com' }) }) } },
    },
  },
  responses: { 201: { content: { 'application/json': { schema: SignupResponse } }, description: 'Key created' }, ...errResponses },
});

const meRoute = createRoute({
  ...auth, method: 'get', path: '/v1/me',
  tags: ['Account'], summary: 'Key info and usage', operationId: 'getMe',
  request: { query: z.object({ history_days: z.string().optional() }) },
  responses: { 200: { content: { 'application/json': { schema: MeResponse } }, description: 'Key info' }, ...errResponses },
});

// ── Register routes + stub handlers ──────────────────────────────
// Split into small groups so TypeScript can track the accumulated route schema
// type without hitting the recursive instantiation depth limit.
// Production request handling is in src/api/routes/*.js — these stubs are
// only for spec generation and client type inference.

const healthGroup = new OpenAPIHono()
  .openapi(healthRoute,  (c) => c.json({ ok: true, status: 'healthy', addresses: 120_000_000, uptime: 0 }, 200))
  .openapi(pingRoute,    (c) => c.json({ ok: true }, 200));

const addressGroup = new OpenAPIHono()
  .openapi(addressRoute,  (c) => c.json({ ok: true, count: 0, data: [] as z.infer<typeof AddressList>['data'] }, 200))
  .openapi(suggestRoute,  (c) => c.json({ ok: true, count: 0, data: [] as z.infer<typeof SuggestResponse>['data'] }, 200))
  .openapi(bulkRoute,     (c) => c.json({ ok: true, count: 0, data: [] as z.infer<typeof BulkResponse>['data'] }, 200))
  .openapi(bulkCsvRoute,  (c) => c.text('', 200))
  .openapi(nearRoute,     (c) => c.json({ ok: true, count: 0, data: [] as z.infer<typeof AddressList>['data'] }, 200))
  .openapi(zipRoute,      (c) => c.json({ ok: true, data: {} }, 200))
  .openapi(coverageRoute, (c) => c.json({ ok: true, count: 0, data: [] as z.infer<typeof CoverageResponse>['data'] }, 200))
  .openapi(statsRoute,    (c) => c.json({ ok: true, data: {} }, 200));

const enrichGroup = new OpenAPIHono()
  .openapi(enrichRoute, (c) => c.json({ ok: true, data: {} as z.infer<typeof EnrichResult> }, 200))
  .openapi(riskRoute,   (c) => c.json({ ok: true } as z.infer<typeof RiskResult>, 200));

const accountGroup = new OpenAPIHono()
  .openapi(signupRoute, (c) => c.json({ ok: true, data: {} as z.infer<typeof SignupResponse>['data'] }, 201))
  .openapi(meRoute,     (c) => c.json({ ok: true, data: {} as z.infer<typeof MeResponse>['data'] }, 200));

const app = _base
  .route('/', healthGroup)
  .route('/', addressGroup)
  .route('/', enrichGroup)
  .route('/', accountGroup);

export { app };
export type AppType = typeof app;

// ── Named schema types ────────────────────────────────────────────
// Import these in your TypeScript project to annotate API responses.
export type AddressResult       = z.infer<typeof AddressResult>;
export type AddressListResponse = z.infer<typeof AddressList>;
export type SuggestItem         = z.infer<typeof SuggestItem>;
export type SuggestResponse     = z.infer<typeof SuggestResponse>;
export type BulkItem            = z.infer<typeof BulkItem>;
export type BulkResponse        = z.infer<typeof BulkResponse>;
export type EnrichResult        = z.infer<typeof EnrichResult>;
export type RiskResult          = z.infer<typeof RiskResult>;
export type SignupResponse      = z.infer<typeof SignupResponse>;
export type MeResponse          = z.infer<typeof MeResponse>;
export type HealthResponse      = z.infer<typeof HealthResponse>;
export type CoverageResponse    = z.infer<typeof CoverageResponse>;
