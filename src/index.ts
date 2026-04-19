/**
 * @geoclear/client — Typed TypeScript client for the GeoClear API.
 *
 * Usage (typed response shapes):
 *   import type { AddressResult, RiskResult } from '@geoclear/client';
 *   const result: AddressResult = await fetch(...).then(r => r.json());
 *
 * Usage (Hono RPC client):
 *   import { hc } from '@geoclear/client';
 *   import type { AppType } from '@geoclear/client';
 *   const client = hc<AppType>('https://geoclear.io');
 */

export { hc } from 'hono/client';

export type {
  AppType,
  AddressResult,
  AddressListResponse,
  SuggestItem,
  SuggestResponse,
  BulkItem,
  BulkResponse,
  EnrichResult,
  RiskResult,
  SignupResponse,
  MeResponse,
  HealthResponse,
  CoverageResponse,
} from '../../../src/api/openapi-app.js';
