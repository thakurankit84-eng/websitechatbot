/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */
// Note: avoid static import of '@supabase/supabase-js' to prevent type/module resolution issues in the build step.

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

// Flag to indicate whether Supabase is configured
export const SUPABASE_ENABLED = Boolean(supabaseUrl && supabaseAnonKey);

function createMockClient() {
  // Final executor that simulates a network response
  const exec = async () => ({ data: null, error: null });

  // Chainable query builder: methods return the builder itself and it's awaitable via then()
  function chainable() {
    const builder: any = {};
    const method = () => builder;

    builder.select = (..._args: unknown[]) => method();
    builder.insert = (..._args: unknown[]) => method();
    builder.update = (..._args: unknown[]) => method();
    builder.delete = (..._args: unknown[]) => method();
    builder.eq = (..._args: unknown[]) => method();
    builder.order = (..._args: unknown[]) => method();
    builder.limit = (..._args: unknown[]) => method();
    builder.single = () => method();
    builder.maybeSingle = () => method();

    // Allow awaiting the builder: returns the mock response
    builder.then = (onFulfilled: any, onRejected: any) => exec().then(onFulfilled, onRejected);
    builder.catch = (onRejected: any) => exec().catch(onRejected);

    return builder;
  }

  return {
    from: (_table: string) => chainable(),
    rpc: (..._args: unknown[]) => exec(),
    auth: {
      signIn: (..._args: unknown[]) => exec(),
      signUp: (..._args: unknown[]) => exec(),
      signOut: (..._args: unknown[]) => exec(),
      user: () => null,
      getSession: async () => ({ data: null, error: null }),
    },
    storage: {
      from: (_bucket: string) => ({
        upload: (..._args: unknown[]) => exec(),
        download: (..._args: unknown[]) => exec(),
        getPublicUrl: (_path: string) => ({ publicURL: '' }),
      }),
    },
  } as unknown as any;
}

// Export a mutable supabase variable. It starts as a mock client so the app can run without keys.
export let supabase: any = createMockClient();

// If env vars are present, dynamically import Supabase and replace the client.
if (SUPABASE_ENABLED) {
  // dynamic import avoids static type/module resolution problems during build
  import('@supabase/supabase-js')
    .then((mod: any) => {
      try {
        supabase = (mod as any).createClient(supabaseUrl as string, supabaseAnonKey as string);
        // console.info('Supabase client initialized');
      } catch (_e) {
        // fallback remains the mock
        // console.error('Failed to initialize Supabase client', e);
      }
    })
    .catch(() => {
      /* ignored */
    });
}

export interface Movie {
  id: string;
  title: string;
  description: string;
  poster_url: string;
  duration: number;
  genre: string;
  rating: string;
  release_date: string;
  created_at: string;
}

export interface Showtime {
  id: string;
  movie_id: string;
  theater: string;
  show_date: string;
  show_time: string;
  available_seats: number;
  total_seats: number;
  price: number;
  created_at: string;
  movies?: Movie;
}

export interface Booking {
  id: string;
  showtime_id: string;
  customer_name: string;
  customer_email: string;
  seats_booked: number;
  total_amount: number;
  booking_date: string;
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string;
  created_at: string;
  // Optional per-emotion override answers (keys are emotion names)
  emotion_answers?: Record<string, string>;
}
