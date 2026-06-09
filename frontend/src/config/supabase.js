import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vordupoedgmwyfpipmru.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvcmR1cG9lZGdtd3lmcGlwbXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk0ODAwMjcsImV4cCI6MjA5NTA1NjAyN30._rzAwHk0OndN93jbz8GaIVLkp_ZvAIK93kGeyux-GsM";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
