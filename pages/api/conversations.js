import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Get user's conversations
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;

    // Get conversations where user is either buyer or seller
    const { data: conversations, error: conversationsError } = await supabaseAdmin
      .from('conversations')
      .select(`
        id,
        listing_id,
        buyer_id,
        seller_id,
        last_message_at,
        created_at,
        listings:listing_id (
          id,
          title,
          price,
          listing_images!inner (
            image_url,
            is_main
          )
        ),
        buyer:buyer_id (
          id,
          full_name,
          display_name
        ),
        seller:seller_id (
          id,
          full_name,
          display_name
        )
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (conversationsError) {
      console.error('Conversations fetch error:', conversationsError);
      return res.status(500).json({
        error: 'Failed to fetch conversations',
        details: conversationsError.message
      });
    }

    // Format conversations with other user info and unread counts
    const formattedConversations = await Promise.all(
      conversations.map(async (conversation) => {
        // Determine who the "other user" is
        const otherUser = conversation.buyer_id === userId 
          ? conversation.seller 
          : conversation.buyer;

        // Get unread message count for this conversation
        const { count: unreadCount } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conversation.id)
          .neq('sender_id', userId)
          .eq('read', false);

        // Get last message
        const { data: lastMessage } = await supabaseAdmin
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Get main listing image
        const mainImage = conversation.listings?.listing_images?.find(img => img.is_main);

        return {
          id: conversation.id,
          listing: {
            id: conversation.listings?.id,
            title: conversation.listings?.title,
            price: conversation.listings?.price,
            image: mainImage?.image_url || null
          },
          otherUser: {
            id: otherUser.id,
            name: otherUser.display_name || otherUser.full_name,
            lastSeen: new Date() // TODO: Implement actual last seen tracking
          },
          lastMessage: lastMessage ? {
            content: lastMessage.message,
            timestamp: new Date(lastMessage.created_at),
            senderId: lastMessage.sender_id,
            read: lastMessage.read
          } : null,
          unreadCount: unreadCount || 0,
          lastMessageAt: new Date(conversation.last_message_at)
        };
      })
    );

    return res.status(200).json({
      success: true,
      conversations: formattedConversations
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch conversations'
    });
  }
}

export default requireAuth(handler);