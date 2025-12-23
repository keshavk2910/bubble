import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth-middleware';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

// Initialize Mailgun
const mailgun = new Mailgun(formData);
const mg = process.env.MAILGUN_API_KEY
  ? mailgun.client({
      username: 'api',
      key: process.env.MAILGUN_API_KEY,
    })
  : null;

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

    // Send email notification to the recipient
    try {
      // Determine recipient ID (the other person in the conversation)
      const recipientId = conversation.buyer_id === userId ? conversation.seller_id : conversation.buyer_id;
      
      // Get recipient's profile information including email and name
      const { data: recipient, error: recipientError } = await supabaseAdmin
        .from('user_profiles')
        .select('email, full_name, display_name')
        .eq('id', recipientId)
        .single();

      // Get sender's information
      const { data: sender, error: senderError } = await supabaseAdmin
        .from('user_profiles')
        .select('full_name, display_name')
        .eq('id', userId)
        .single();

      if (!recipientError && recipient && recipient.email && !senderError && sender) {
        // Get conversation details for context
        const { data: conversationDetails, error: convError } = await supabaseAdmin
          .from('conversations')
          .select(`
            *,
            listing:listings(
              title,
              slug,
              id
            )
          `)
          .eq('id', conversationId)
          .single();

        const senderName = sender.display_name || sender.full_name || 'Someone';
        const recipientName = recipient.display_name || recipient.full_name || 'User';
        const listingTitle = conversationDetails?.listing?.title || 'a listing';
        const chatLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/messages?conversation=${conversationId}`;
        
        // Send email notification
        if (mg && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_FROM_EMAIL) {
          await mg.messages.create(process.env.MAILGUN_DOMAIN, {
            from: process.env.MAILGUN_FROM_EMAIL,
            to: [recipient.email],
            subject: `New message from ${senderName} - Bins Buy Sell`,
            html: `
              <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #16a34a; text-align: center;">New Message Received</h2>
                
                <div style="background: #f8f9fa; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                  <h3 style="margin: 0 0 10px 0; color: #333;">From: ${senderName}</h3>
                  <p style="margin: 0 0 10px 0; color: #666;">Regarding: ${listingTitle}</p>
                  <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <p style="margin: 0; color: #333; font-size: 16px;">"${message.length > 100 ? message.substring(0, 100) + '...' : message}"</p>
                  </div>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${chatLink}" 
                     style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    View Message & Reply
                  </a>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                  <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                    This email was sent because you have an active conversation on Bins Buy Sell.<br>
                    You can manage your notification preferences in your account settings.
                  </p>
                </div>
              </div>
            `,
          });
          console.log(`📧 Message notification email sent to ${recipient.email}`);
        } else {
          console.log('📧 Email notification skipped - Mailgun not configured');
        }
      } else {
        console.log('📧 Email notification skipped - recipient email not found or invalid user data');
      }
    } catch (emailError) {
      console.error('📧 Failed to send email notification:', emailError);
      // Don't fail the message sending if email fails
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