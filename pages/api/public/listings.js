import { supabaseAdmin } from '../../../lib/supabase';

// Get public listings (no authentication required)
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      search, 
      category, 
      priceRange, 
      location, 
      condition,
      sort = 'newest',
      page = 1,
      limit = 12 
    } = req.query;

    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        user_profiles!inner (
          display_name,
          full_name,
          phone_verified,
          email_verified,
          user_type
        ),
        listing_images (
          id,
          image_url,
          is_main,
          display_order
        )
      `)
      .in('status', ['active', 'pending']) // Show active and pending listings to public
      .is('deleted_at', null); // Exclude deleted listings

    // Search functionality
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Category filter
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Price range filter
    if (priceRange && priceRange !== 'all') {
      const [min, max] = priceRange.split('-').map(p => 
        p.includes('+') ? 999999999 : parseInt(p) || 0
      );
      query = query.gte('price', min).lte('price', max);
    }

    // Location filter (ZIP code contains)
    if (location && location.trim()) {
      query = query.ilike('zip_code', `%${location}%`);
    }

    // Condition filter
    if (condition && condition !== 'all') {
      query = query.eq('condition', condition);
    }

    // Sorting
    switch (sort) {
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'newest':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const offset = (pageNum - 1) * limitNum;

    query = query.range(offset, offset + limitNum - 1);

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Public listings fetch error:', error);
      return res.status(500).json({
        error: 'Failed to fetch listings',
        details: error.message
      });
    }

    // Format listings with additional data
    const formattedListings = listings.map(listing => ({
      ...listing,
      main_image: listing.listing_images.find(img => img.is_main)?.image_url || null,
      image_count: listing.listing_images.length,
      seller_name: listing.user_profiles.display_name || listing.user_profiles.full_name,
      seller_verified: listing.user_profiles.phone_verified && listing.user_profiles.email_verified,
      seller_type: listing.user_profiles.user_type
    }));

    return res.status(200).json({
      success: true,
      listings: formattedListings,
      pagination: {
        current_page: pageNum,
        per_page: limitNum,
        total_results: count || formattedListings.length,
        total_pages: Math.ceil((count || formattedListings.length) / limitNum)
      }
    });

  } catch (error) {
    console.error('Public listings error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch public listings'
    });
  }
}
