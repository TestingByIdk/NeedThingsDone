const SUPABASE_URL = "https://agyfowvvcowkuyalcemh.supabase.co";
const SUPABASE_KEY = "sb_publishable_7SonysYn2EJ3_VCaT32DHg_vMqM_bmK";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

console.log("🐙 Connected to NeedThingsDone!");
