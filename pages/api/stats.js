import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Get dashboard statistics for the current user
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const isAdmin = req.profile.role === 'admin';

    if (isAdmin) {
      // Admin stats
      const [
        { count: totalUsers },
        { count: serviceProviders },
        { count: totalListings },
        { count: activeListings },
        { count: pendingListings },
        { count: sponsoredListings },
        { count: blockedUsers }
      ] = await Promise.all([
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'service_provider'),
        supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'sponsored'),
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('status', 'blocked')
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          totalUsers: totalUsers || 0,
          serviceProviders: serviceProviders || 0,
          customers: (totalUsers || 0) - (serviceProviders || 0),
          blockedUsers: blockedUsers || 0,
          totalListings: totalListings || 0,
          activeListings: activeListings || 0,
          pendingListings: pendingListings || 0,
          sponsoredListings: sponsoredListings || 0,
          binsBuySellListings: 0, // Can be added if needed
          inactiveListings: (totalListings || 0) - (activeListings || 0) - (pendingListings || 0) - (sponsoredListings || 0)
        }
      });
    } else {
      // User stats
      const [
        { count: totalListings },
        { count: activeListings },
        { count: wishlistCount },
        { count: unreadMessages }
      ] = await Promise.all([
        supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseAdmin.from('listings').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
        supabaseAdmin.from('wishlists').select('*', { count: 'exact', head: true }).eq('user_id', userId),
        supabaseAdmin.from('messages').select(`
          *,
          conversations!inner(buyer_id, seller_id)
        `, { count: 'exact', head: true })
        .neq('sender_id', userId)
        .eq('read', false)
        .or(`conversations.buyer_id.eq.${userId},conversations.seller_id.eq.${userId}`)
      ]);

      return res.status(200).json({
        success: true,
        stats: {
          total_listings: totalListings || 0,
          active_listings: activeListings || 0,
          draft_listings: (totalListings || 0) - (activeListings || 0),
          wishlist_count: wishlistCount || 0,
          unread_messages: unreadMessages || 0
        }
      });
    }

  } catch (error) {
    console.error('Get stats error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch dashboard statistics'
    });
  }
}

export default requireAuth(handler);