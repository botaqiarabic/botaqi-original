// # Provides browser/server Supabase helpers and camelCase normalization for Botaqi Web data layers.
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const browserSupabase: SupabaseLikeClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createNoopClient();

type QueryBuilder = {
  select: () => Promise<{ data: unknown; error: unknown }>;
  insert: () => Promise<{ data: unknown; error: unknown }>;
  update: () => Promise<{ data: unknown; error: unknown }>;
  upsert: () => Promise<{ data: unknown; error: unknown }>;
  delete: () => Promise<{ data: unknown; error: unknown }>;
};

type ContainsFrom = {
  from: (..._args: unknown[]) => QueryBuilder;
};

type SupabaseLikeClient = SupabaseClient | ContainsFrom;

export const useSupabaseClient = (): SupabaseLikeClient => browserSupabase;

export const createServerClient = (): SupabaseClient => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be defined for server Supabase client.');
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
    },
  });
};

export const camelize = (input: string): string =>
  input.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

export const normalizeKeys = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map(normalizeKeys) as T;
  }

  if (value === null || typeof value !== 'object') {
    return value;
  }

  const normalized = {} as Record<string, unknown>;
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    normalized[camelize(key)] = normalizeKeys(val);
  }

  return normalized as T;
};

function createNoopClient(): ContainsFrom {
  const noop = async () => ({ data: null, error: null });

  return {
    from: () => ({
      select: noop,
      insert: noop,
      update: noop,
      upsert: noop,
      delete: noop,
    }),
  };
}
