import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth-middleware';

// Get messages for a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.query;
    const userId = req.user.id;

    // Verify user has access to this conversation
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only access your own conversations'
      });
    }

    // Get messages for this conversation with attachments
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        message_attachments (
          id,
          file_url,
          file_name,
          file_type,
          file_size
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      return res.status(500).json({
        error: 'Failed to fetch messages',
        details: messagesError.message
      });
    }

    // Mark messages as read (except those sent by current user)
    const { error: readError } = await supabaseAdmin
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('read', false);

    if (readError) {
      console.error('Mark messages as read error:', readError);
    } else {
      console.log('Messages marked as read for conversation:', conversationId);
    }

    return res.status(200).json({
      success: true,
      messages: messages.map(message => ({
        id: message.id,
        content: message.message,
        senderId: message.sender_id,
        timestamp: new Date(message.created_at),
        read: message.read,
        attachments: message.message_attachments || []
      }))
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch messages'
    });
  }
};

// Send a new message
const sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.query;
    const { message, attachmentId } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        error: 'Message content is required'
      });
    }

    // Verify user has access to this conversation
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only send messages in your own conversations'
      });
    }

    // Insert new message
    const { data: newMessage, error: messageError } = await supabaseAdmin
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: userId,
        message: message.trim()
      })
      .select()
      .single();

    if (messageError) {
      return res.status(500).json({
        error: 'Failed to send message',
        details: messageError.message
      });
    }

    // If there&apos;s an attachment, link it to the message
    let attachmentData = null;
    if (attachmentId) {
      console.log('🔗 Linking attachment to message:', attachmentId);
      
      const { data: newAttachment, error: attachmentError } = await supabaseAdmin
        .from('message_attachments')
        .insert({
          message_id: newMessage.id,
          file_url: attachmentId.file_url,
          file_name: attachmentId.file_name,
          file_type: attachmentId.file_type,
          file_size: attachmentId.file_size
        })
        .select()
        .single();

      if (attachmentError) {
        console.error('❌ Failed to link attachment:', attachmentError);
      } else {
        console.log('✅ Attachment linked successfully:', newAttachment);
        attachmentData = newAttachment;
      }
    }

    return res.status(201).json({
      success: true,
      message: {
        id: newMessage.id,
        content: newMessage.message,
        senderId: newMessage.sender_id,
        timestamp: new Date(newMessage.created_at),
        read: false,
        attachments: attachmentData ? [attachmentData] : []
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not send message'
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getMessages(req, res);
    case 'POST':
      return sendMessage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);