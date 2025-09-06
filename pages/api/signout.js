import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sign out from Supabase (this invalidates the session)
    const { error } = await supabaseAdmin.auth.signOut();

    if (error) {
      console.error('Sign out error:', error);
      return res.status(400).json({
        error: 'Sign out failed',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Signed out successfully'
    });

  } catch (error) {
    console.error('Sign out error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during sign out'
    });
  }
}