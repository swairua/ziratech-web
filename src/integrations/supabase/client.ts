// Supabase has been replaced with mysqli-based API (api.php)
// All database operations now use src/lib/apiClient.ts instead
// This file is kept for backward compatibility but should not be used

export const supabase = null as any;

console.warn('Supabase client is disabled. Using apiClient instead.');
