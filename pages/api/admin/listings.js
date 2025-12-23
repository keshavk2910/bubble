import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/auth-middleware';

// Get all listings for admin management
const getAllListings = async (req, res) => {
  try {
    const { status, search, limit = 50, offset = 0, include_deleted = 'false', deleted_only = 'false', user_id, featured_only = 'false' } = req.query;

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

    // Helper function to apply filters consistently
    const applyFilters = (baseQuery) => {
      let filteredQuery = baseQuery;
      
      // Handle deleted listings filtering
      if (deleted_only === 'true') {
        filteredQuery = filteredQuery.eq('status', 'deleted');
      } else if (include_deleted !== 'true') {
        filteredQuery = filteredQuery.neq('status', 'deleted').is('deleted_at', null);
      }

      if (status && status !== 'all' && status !== 'All' && deleted_only !== 'true') {
        filteredQuery = filteredQuery.eq('status', status);
      }

      if (user_id) {
        filteredQuery = filteredQuery.eq('user_id', user_id);
      }

      if (featured_only === 'true') {
        filteredQuery = filteredQuery.eq('featured', true);
      }

      if (search && search.trim()) {
        filteredQuery = filteredQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      return filteredQuery;
    };

    // Apply filters to main query
    query = applyFilters(query);

    // Get total count for pagination using same filters
    let countQuery = supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true });
    
    countQuery = applyFilters(countQuery);

    const { count: totalCount, error: countError } = await countQuery;

    console.log('Admin Listings API Debug:', {
      requestParams: req.query,
      listingsFound: listings.length,
      totalCount,
      deleted_only,
      include_deleted,
      featured_only,
      status,
      user_id
    });

    return res.status(200).json({
      success: true,
      listings: listings.map(listing => ({
        ...listing,
        main_image: listing.listing_images.find(img => img.is_main)?.image_url || null,
        image_count: listing.listing_images.length,
        seller_name: listing.user_profiles.display_name || listing.user_profiles.full_name,
        seller_email: listing.user_profiles.email
      })),
      pagination: {
        total: totalCount || 0,
        page: Math.floor(parseInt(offset) / parseInt(limit)) + 1,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
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