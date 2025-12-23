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
      const initialMessage = `Hi! I'm interested in your listing: ${listing.title}. Is it still available?`;
      
      await supabaseAdmin
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: buyerId,
          message: initialMessage
        });

      // Send email notification to the seller about the new inquiry
      try {
        // Get seller's profile information
        const { data: seller, error: sellerError } = await supabaseAdmin
          .from('user_profiles')
          .select('email, full_name, display_name')
          .eq('id', sellerId)
          .single();

        // Get buyer's information
        const { data: buyer, error: buyerError } = await supabaseAdmin
          .from('user_profiles')
          .select('full_name, display_name')
          .eq('id', buyerId)
          .single();

        if (!sellerError && seller && seller.email && !buyerError && buyer) {
          const sellerName = seller.display_name || seller.full_name || 'User';
          const buyerName = buyer.display_name || buyer.full_name || 'Someone';
          const chatLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/dashboard/messages?conversation=${conversationId}`;
          
          // Send email notification to seller
          if (mg && process.env.MAILGUN_DOMAIN && process.env.MAILGUN_FROM_EMAIL) {
            await mg.messages.create(process.env.MAILGUN_DOMAIN, {
              from: process.env.MAILGUN_FROM_EMAIL,
              to: [seller.email],
              subject: `New inquiry about your listing: ${listing.title} - Bins Buy Sell`,
              html: `
                <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
                  <h2 style="color: #16a34a; text-align: center;">New Listing Inquiry</h2>
                  
                  <div style="background: #f8f9fa; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; color: #333;">From: ${buyerName}</h3>
                    <p style="margin: 0 0 10px 0; color: #666;">Regarding: ${listing.title}</p>
                    <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 15px;">
                      <p style="margin: 0; color: #333; font-size: 16px;">"${initialMessage}"</p>
                    </div>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${chatLink}" 
                       style="background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                      Reply to Inquiry
                    </a>
                  </div>

                  <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
                    <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                      This email was sent because someone is interested in your listing on Bins Buy Sell.<br>
                      You can manage your notification preferences in your account settings.
                    </p>
                  </div>
                </div>
              `,
            });
            console.log(`📧 Initial inquiry notification email sent to ${seller.email} for listing: ${listing.title}`);
          } else {
            console.log('📧 Initial inquiry email notification skipped - Mailgun not configured');
          }
        } else {
          console.log('📧 Initial inquiry email notification skipped - seller email not found or invalid user data');
        }
      } catch (emailError) {
        console.error('📧 Failed to send initial inquiry email notification:', emailError);
        // Don't fail the conversation creation if email fails
      }
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