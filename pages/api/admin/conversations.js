import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/auth-middleware';

// Get all conversations for admin monitoring
const getAllConversations = async (req, res) => {
  try {
    const { search, limit = 50, offset = 0, status = 'all' } = req.query;

    let query = supabaseAdmin
      .from('conversations')
      .select(`
        *,
        listing:listings!conversations_listing_id_fkey (
          id,
          title,
          price,
          status
        ),
        buyer:user_profiles!conversations_buyer_id_fkey (
          id,
          full_name,
          email,
          display_name
        ),
        seller:user_profiles!conversations_seller_id_fkey (
          id,
          full_name,
          email,
          display_name
        ),
        messages!inner (
          id,
          message,
          created_at,
          sender_id,
          read
        )
      `)
      .order('last_message_at', { ascending: false });

    // Search functionality
    if (search && search.trim()) {
      // Search in listing titles or user names
      query = query.or(`listing.title.ilike.%${search}%,buyer.full_name.ilike.%${search}%,seller.full_name.ilike.%${search}%`);
    }

    // Status filtering not available for conversations table

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    }

    const { data: conversations, error } = await query;

    if (error) {
      console.error('Fetch conversations error:', error);
      return res.status(500).json({
        error: 'Failed to fetch conversations',
        details: error.message
      });
    }

    // Process conversations to add metadata
    const processedConversations = conversations.map(conv => {
      const messages = conv.messages || [];
      const lastMessage = messages.length > 0 ? 
        messages.reduce((latest, msg) => 
          new Date(msg.created_at) > new Date(latest.created_at) ? msg : latest
        ) : null;

      return {
        ...conv,
        message_count: messages.length,
        last_message: lastMessage,
        last_message_preview: lastMessage?.message?.substring(0, 100) || 'No messages',
        participants: [conv.buyer, conv.seller].filter(Boolean)
      };
    });

    return res.status(200).json({
      success: true,
      conversations: processedConversations,
      total: processedConversations.length
    });

  } catch (error) {
    console.error('Get admin conversations error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch conversations'
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getAllConversations(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAdmin(handler);