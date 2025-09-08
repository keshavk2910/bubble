import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/auth-middleware';

// Get all listings for admin management
const getAllListings = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0, include_deleted = 'false', deleted_only = 'false' } = req.query;

    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        user_profiles!inner (
          full_name,
          email,
          display_name
        ),
        listing_images (
          id,
          image_url,
          is_main,
          display_order
        )
      `)
      .order('created_at', { ascending: false });

    // Handle deleted listings filtering
    if (deleted_only === 'true') {
      // Show only deleted listings
      query = query.eq('status', 'deleted');
    } else if (include_deleted !== 'true') {
      // Exclude deleted listings (default behavior)
      query = query.neq('status', 'deleted').is('deleted_at', null);
    }

    if (status && status !== 'all' && deleted_only !== 'true') {
      query = query.eq('status', status);
    }

    // Search functionality
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    }

    const { data: listings, error } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch listings',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      listings: listings.map(listing => ({
        ...listing,
        main_image: listing.listing_images.find(img => img.is_main)?.image_url || null,
        image_count: listing.listing_images.length,
        seller_name: listing.user_profiles.display_name || listing.user_profiles.full_name,
        seller_email: listing.user_profiles.email
      }))
    });

  } catch (error) {
    console.error('Get admin listings error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch listings'
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getAllListings(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);