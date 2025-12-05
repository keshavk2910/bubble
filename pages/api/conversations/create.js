import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth-middleware';

// Create or get existing conversation for a listing
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listingId } = req.body;
    const buyerId = req.user.id;

    if (!listingId) {
      return res.status(400).json({
        error: 'Missing listing ID',
        details: 'Listing ID is required to create a conversation'
      });
    }

    // Get listing details and verify it exists and is active
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select(`
        id,
        title,
        user_id,
        status,
        listing_images (
          image_url,
          is_main
        )
      `)
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({
        error: 'Listing not found'
      });
    }

    // Check if listing is active/visible
    if (!['active', 'sponsored', 'bins_buy_sell'].includes(listing.status)) {
      return res.status(403).json({
        error: 'Listing not available',
        details: 'This listing is not currently available for inquiries'
      });
    }

    // Prevent seller from contacting themselves
    if (listing.user_id === buyerId) {
      return res.status(400).json({
        error: 'Cannot contact yourself',
        details: 'You cannot start a conversation with yourself about your own listing'
      });
    }

    const sellerId = listing.user_id;

    // Check if conversation already exists
    const { data: existingConversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select('id')
      .eq('listing_id', listingId)
      .eq('buyer_id', buyerId)
      .eq('seller_id', sellerId)
      .single();

    let conversationId;

    if (existingConversation) {
      // Use existing conversation
      conversationId = existingConversation.id;
    } else {
      // Create new conversation
      const { data: newConversation, error: createError } = await supabaseAdmin
        .from('conversations')
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
          last_message_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Conversation creation error:', createError);
        return res.status(500).json({
          error: 'Failed to create conversation',
          details: createError.message
        });
      }

      conversationId = newConversation.id;

      // Send initial system message to start the conversation
      await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: buyerId,
          message: `Hi! I'm interested in your listing: ${listing.title}. Is it still available?`
        });
    }

    return res.status(200).json({
      success: true,
      conversationId: conversationId,
      message: existingConversation 
        ? 'Existing conversation found' 
        : 'New conversation created',
      listing: {
        id: listing.id,
        title: listing.title,
        mainImage: listing.listing_images?.find(img => img.is_main)?.image_url || null
      }
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not create conversation'
    });
  }
}

export default requireAuth(handler);