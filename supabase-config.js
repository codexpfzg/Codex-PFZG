window.SUPABASE_URL = 'https://euulnysegtjhsfdtvvxx.supabase.co';
window.SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_JuBiMevxCR5SoWdAnIEJ6A_xQ4uY70x';

window.ADS_ENABLED = false;

function createSupabaseClient() {
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_PUBLISHABLE_KEY) return null;
  return window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_PUBLISHABLE_KEY);
}

window.supabaseConfig = function supabaseConfig() {
  return createSupabaseClient();
};