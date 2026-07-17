const SUPABASE_URL = "https://agyfowvvcowkuyalcemh.supabase.co";
const SUPABASE_KEY = "sb_publishable_7SonysYn2EJ3_VCaT32DHg_vMqM_bmK";

if (!window.supabase || typeof window.supabase.createClient !== "function") {
    console.error("Supabase library failed to load.");
    window.supabaseClient = null;
} else {
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY,
        {
            auth: {
                flowType: "implicit",
                detectSessionInUrl: true,
                persistSession: true,
                autoRefreshToken: true
            }
        }
    );

    console.log("🐙 Connected to NeedThingsDone!");
}
