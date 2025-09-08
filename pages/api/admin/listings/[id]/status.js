import { supabaseAdmin } from '../../../../../lib/supabase';
import { requireAdmin } from '../../../../../lib/auth-middleware';

// Update listing status (admin only)
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
    const validStatuses = ['pending', 'active', 'inactive', 'sponsored', 'bubble_binz', 'deleted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        details: 'Status must be one of: ' + validStatuses.join(', ')
      });
    }

    // Check if listing exists
    const { data: existingListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('id, title, status, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingListing) {
      return res.status(404).json({
        error: 'Listing not found'
      });
    }

    // Update listing status
    const updateData = { status };
    
    // If setting to deleted, add deleted_at timestamp
    if (status === 'deleted') {
      updateData.deleted_at = new Date().toISOString();
    }
    // If restoring from deleted, clear deleted_at
    else if (existingListing.status === 'deleted' && status !== 'deleted') {
      updateData.deleted_at = null;
    }

    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to update listing status',
        details: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: `Listing status updated to ${status}`,
      listing: updatedListing
    });

  } catch (error) {
    console.error('Update listing status error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update listing status'
    });
  }
}

export default requireAdmin(handler);