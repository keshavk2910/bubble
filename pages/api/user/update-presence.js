import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth-middleware';

// Update user's last seen timestamp
async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;

    // Update user's last seen timestamp
    const { error } = await supabaseAdmin
      .from('user_profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      return res.status(500).json({
        error: 'Failed to update presence',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Presence updated successfully'
    });

  } catch (error) {
    console.error('Update presence error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update user presence'
    });
  }
}

export default requireAuth(handler);