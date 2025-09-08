import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (NEVER use on frontend)
// Only import this in API routes and server-side functions
let supabaseAdmin;
if (typeof window === 'undefined') {
  // Only create admin client on server-side
  supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export { supabaseAdmin };

// Frontend-safe Supabase client with anon key (for auth and realtime)
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);

// Server-side helper functions using admin client
export const getUserProfileServer = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
};

export const isAdminServer = async (userId) => {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single();

  return { isAdmin: data?.role === 'admin', error };
};

export const updateUserProfileServer = async (userId, updates) => {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
};

// JWT verification helper for server-side routes
export const verifyServerToken = async (token) => {
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);
  return { user, error };
};
