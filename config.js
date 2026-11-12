// Datos de conexión con Supabase (Project Settings → API).
// La publishable key es pública por diseño: la seguridad la ponen las reglas (RLS) de la base de datos.
window.ALMARA_CONFIG = {
  supabaseUrl: "https://ugryeciokjktvuuxvqcu.supabase.co",
  supabaseAnonKey: "sb_publishable_QPBtZJ8mDOM7XMNzU9Hm_g_dhMBUTla",
  // Clave pública para las notificaciones de la app (la privada está solo en Supabase)
  vapidPublicKey: "BJZ_G7L3IbvmLU0-XUky9k_m4nkLTrEI2PsfE2WuOm3bkXc-rhfkdcj52GRl5-E6zCbMjDHqcAxP-okwJjag2tE"
};
