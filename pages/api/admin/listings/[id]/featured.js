import { supabaseAdmin } from '../../../../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate admin user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Get user profile to verify admin role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.query;
    const { featured } = req.body;

    if (typeof featured !== 'boolean') {
      return res.status(400).json({ 
        error: 'Invalid featured value',
        details: 'Featured must be true or false'
      });
    }

    // Update listing featured status
    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from('listings')
      .update({ 
        featured: featured,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('id, title, featured')
      .single();

    if (updateError) {
      console.error('Featured update error:', updateError);
      return res.status(500).json({ 
        error: 'Failed to update featured status',
        details: updateError.message 
      });
    }

    if (!updatedListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    res.status(200).json({ 
      success: true,
      message: `Listing ${featured ? 'featured' : 'unfeatured'} successfully`,
      listing: updatedListing
    });

  } catch (error) {
    console.error('Featured toggle error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to toggle featured status'
    });
  }
}