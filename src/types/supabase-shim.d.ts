/* eslint-disable */

// Minimal shim for supabase to satisfy TypeScript and lint during build in this workspace.
declare module '@supabase/supabase-js' {
  export type SupabaseClient = any;
  export function createClient(url: string, key: string): SupabaseClient;
}
