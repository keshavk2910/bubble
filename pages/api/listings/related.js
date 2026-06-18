import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { category, excludeId, limit = 3 } = req.query;

  try {
    // Check if excludeId is a UUID or slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(excludeId);
    
    let query = supabaseAdmin
      .from('listings')
      .select(`
        id,
        title,
        price,
        category,
        zip_code,
        description,
        created_at,
        slug,
        listing_images!listing_images_listing_id_fkey(
          image_url,
          is_main
        )
      `)
      .in('status', ['active', 'pending'])
      .eq('category', category)
      .limit(parseInt(limit));

    // Exclude current listing by ID or slug
    if (excludeId) {
      if (isUUID) {
        query = query.neq('id', excludeId);
      } else {
        query = query.neq('slug', excludeId);
      }
    }

    const { data: listings, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to fetch related listings' });
    }

    // Process listings to get main image
    const processedListings = listings.map(listing => ({
      ...listing,
      main_image: listing.listing_images?.find(img => img.is_main)?.image_url || 
                  listing.listing_images?.[0]?.image_url ||
                  null
    }));

    res.status(200).json({ listings: processedListings });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
