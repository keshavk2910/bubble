import { supabaseAdmin } from '../../../lib/supabase';

export default async function handler(req, res) {
  const { id } = req.query;
  const { includeInactive } = req.query;

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Check if id is a UUID (listing ID) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    // Build the base select query
    const selectQuery = `
      *,
      user:user_profiles(
        id,
        full_name,
        display_name,
        avatar_url,
        email_verified,
        phone_verified,
        user_type,
        registration_date,
        updated_at
      ),
      images:listing_images(
        id,
        image_url,
        is_main,
        display_order
      )
    `;

    let listing, error;

    // Try to find by ID first (UUID)
    if (isUUID) {
      const result = await supabaseAdmin
        .from('listings')
        .select(selectQuery)
        .eq('id', id)
        .single();
      listing = result.data;
      error = result.error;
    } else {
      // Try to find by slug
      const result = await supabaseAdmin
        .from('listings')
        .select(selectQuery)
        .eq('slug', id)
        .single();
      listing = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Supabase error:', error);
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // If includeInactive is true, verify user owns the listing
    if (includeInactive === 'true' && listing.status !== 'active') {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } =
          await supabaseAdmin.auth.getUser(token);

        if (userError || !userData.user) {
          return res.status(401).json({ error: 'Invalid authentication' });
        }

        // Check if user owns this listing
        if (listing.user_id !== userData.user.id) {
          return res.status(403).json({ error: 'Access denied' });
        }
      } catch (authError) {
        console.error('Auth error:', authError);
        return res.status(401).json({ error: 'Authentication failed' });
      }
    }

    // Sort images by display_order
    if (listing.images) {
      listing.images.sort((a, b) => a.display_order - b.display_order);
    }

    // Increment views count (only for active listings viewed by non-owners)
    if (listing.status === 'active') {
      const updateQuery = isUUID 
        ? supabaseAdmin.from('listings').update({ views_count: (listing.views_count || 0) + 1 }).eq('id', id)
        : supabaseAdmin.from('listings').update({ views_count: (listing.views_count || 0) + 1 }).eq('slug', id);
      
      await updateQuery;
    }

    res.status(200).json({ listing });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
