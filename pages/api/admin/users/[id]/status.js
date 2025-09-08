import { supabaseAdmin } from '../../../../../lib/supabase';
import { requireAdmin } from '../../../../../lib/auth-middleware';

// Update user status and handle listing effects (admin only)
async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Missing status',
        details: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['active', 'blocked'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        details: 'Status must be either active or blocked'
      });
    }

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, status')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Start transaction for user status and listing updates
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to update user status',
        details: updateError.message
      });
    }

    // Handle listing status changes based on user status
    if (status === 'blocked') {
      // When blocking user, soft delete all their active listings
      const { error: listingError } = await supabaseAdmin
        .from('listings')
        .update({ 
          status: 'deleted',
          deleted_at: new Date().toISOString()
        })
        .eq('user_id', id)
        .in('status', ['active', 'pending', 'sponsored', 'bubble_binz']);

      if (listingError) {
        console.error('Failed to update user listings on block:', listingError);
        // Don't fail the user blocking if listing updates fail
      }
    } else if (status === 'active' && existingUser.status === 'blocked') {
      // When unblocking user, restore their listings to pending for review
      const { error: listingError } = await supabaseAdmin
        .from('listings')
        .update({ 
          status: 'pending',
          deleted_at: null
        })
        .eq('user_id', id)
        .eq('status', 'deleted')
        .not('deleted_at', 'is', null);

      if (listingError) {
        console.error('Failed to restore user listings on unblock:', listingError);
        // Don't fail the user unblocking if listing updates fail
      }
    }

    // Get updated listing counts for response
    const { count: affectedListings } = await supabaseAdmin
      .from('listings')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', id);

    return res.status(200).json({
      success: true,
      message: `User ${status === 'blocked' ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser,
      affected_listings: affectedListings || 0
    });

  } catch (error) {
    console.error('Update user status error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update user status'
    });
  }
}

export default requireAdmin(handler);