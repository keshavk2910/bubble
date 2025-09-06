import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Get current user session and profile information
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Return basic user info immediately without expensive stats queries
    // Stats can be loaded separately if needed
    return res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        email: req.user.email,
        emailConfirmed: req.user.email_confirmed_at ? true : false
      },
      profile: {
        ...req.profile,
        email_verified: req.profile.email_verified || false
      },
      stats: {
        total_listings: 0,
        active_listings: 0,
        wishlist_count: 0,
        unread_messages: 0
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch user information'
    });
  }
}

export default requireAuth(handler);