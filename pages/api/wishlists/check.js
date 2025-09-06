import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    const user = userData.user;

    const { listingId } = req.query;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    // Convert slug to UUID if needed
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(listingId);
    let actualListingId = listingId;

    if (!isUUID) {
      // Get the actual UUID from slug
      const { data: listing, error: listingError } = await supabaseAdmin
        .from('listings')
        .select('id')
        .eq('slug', listingId)
        .single();

      if (listingError || !listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      actualListingId = listing.id;
    }

    // Check if listing exists in user's wishlist
    const { data, error } = await supabaseAdmin
      .from('wishlists')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', actualListingId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Failed to check wishlist' });
    }

    res.status(200).json({ isSaved: !!data });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}