import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
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

    const { listingId } = req.body;

    if (req.method === 'POST') {
      // Add to wishlist
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

      // Check if already exists
      const { data: existing } = await supabaseAdmin
        .from('wishlists')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', actualListingId)
        .single();

      if (existing) {
        return res.status(400).json({ error: 'Listing already in wishlist' });
      }

      // Add to wishlist
      const { data, error } = await supabaseAdmin
        .from('wishlists')
        .insert({
          user_id: user.id,
          listing_id: actualListingId
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to save listing' });
      }

      res.status(200).json({ message: 'Listing saved to wishlist', wishlist: data });

    } else if (req.method === 'DELETE') {
      // Remove from wishlist
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

      const { error } = await supabaseAdmin
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', actualListingId);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to remove listing from wishlist' });
      }

      res.status(200).json({ message: 'Listing removed from wishlist' });

    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}