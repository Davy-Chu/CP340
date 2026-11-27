import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export class ReviewConfigurationError extends Error {
  constructor() {
    super('Reviews require valid SUPABASE_URL and SUPABASE_SECRET_KEY server environment variables.');
  }
}

let client: SupabaseClient | undefined;

// Initialize on first use, after index.ts has loaded dotenv. Review configuration
// failures must not prevent the app or Stripe checkout from starting.
export function getSupabaseClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL?.trim();
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey || url.includes('replace_me') || secretKey.includes('replace_me')) {
    throw new ReviewConfigurationError();
  }
  try {
    client = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    return client;
  } catch {
    throw new ReviewConfigurationError();
  }
}
