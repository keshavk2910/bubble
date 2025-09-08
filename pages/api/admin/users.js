import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/auth-middleware';

// Get all users for admin management
const getAllUsers = async (req, res) => {
  try {
    const { status, search, user_type, limit = 50, offset = 0 } = req.query;

    let query = supabaseAdmin
      .from('user_profiles')
      .select(
        `
        *
      `
      )
      .order('registration_date', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (user_type && user_type !== 'all') {
      query = query.eq('user_type', user_type);
    }

    // Search functionality
    if (search && search.trim()) {
      query = query.or(
        `full_name.ilike.%${search}%,email.ilike.%${search}%,display_name.ilike.%${search}%`
      );
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(
        parseInt(offset),
        parseInt(offset) + parseInt(limit) - 1
      );
    }

    const { data: users, error } = await query;
    console.log('error', error);
    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch users',
        details: error.message,
      });
    }

    // Get listings count for each user separately
    const usersWithCounts = await Promise.all(
      users.map(async (user) => {
        const { count } = await supabaseAdmin
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .is('deleted_at', null);

        return {
          ...user,
          listing_count: count || 0,
        };
      })
    );

    return res.status(200).json({
      success: true,
      users: usersWithCounts,
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch users',
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getAllUsers(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);
