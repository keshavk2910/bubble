import { supabaseAdmin } from '../../../../../lib/supabase';
import { requireAdmin } from '../../../../../lib/auth-middleware';

// Get all messages for a specific conversation (admin only)
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id: conversationId } = req.query;
    const { limit = 100, offset = 0 } = req.query;

    // First, get conversation details
    const { data: conversation, error: convError } = await supabaseAdmin
      .from('conversations')
      .select(`
        *,
        listing:listings!conversations_listing_id_fkey (
          id,
          title,
          price,
          status,
          main_image:listing_images!inner (
            image_url
          )
        ),
        buyer:user_profiles!conversations_buyer_id_fkey (
          id,
          full_name,
          email,
          display_name,
          phone
        ),
        seller:user_profiles!conversations_seller_id_fkey (
          id,
          full_name,
          email,
          display_name,
          phone
        )
      `)
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    // Get all messages for this conversation
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        message,
        read,
        created_at,
        sender:user_profiles!messages_sender_id_fkey (
          id,
          full_name,
          display_name
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (messagesError) {
      console.error('Fetch messages error:', messagesError);
      return res.status(500).json({
        error: 'Failed to fetch messages',
        details: messagesError.message
      });
    }

    // Process conversation data
    const processedConversation = {
      ...conversation,
      listing: {
        ...conversation.listing,
        main_image: conversation.listing?.main_image?.[0]?.image_url || null
      }
    };

    return res.status(200).json({
      success: true,
      conversation: processedConversation,
      messages: messages || [],
      total_messages: messages?.length || 0
    });

  } catch (error) {
    console.error('Get conversation messages error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch conversation messages'
    });
  }
}

export default requireAdmin(handler);