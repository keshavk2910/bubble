import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Get user profile
const getProfile = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        id,
        full_name,
        display_name,
        email,
        country,
        zip_code,
        phone,
        phone_verified,
        address,
        user_type,
        role,
        status,
        registration_date,
        updated_at
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({
        error: 'Profile not found',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch profile'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const {
      full_name,
      display_name,
      country,
      zip_code,
      phone,
      address
    } = req.body;

    const updateData = {};
    
    // Only update provided fields
    if (full_name !== undefined) updateData.full_name = full_name;
    if (display_name !== undefined) updateData.display_name = display_name;
    if (country !== undefined) updateData.country = country;
    if (zip_code !== undefined) updateData.zip_code = zip_code;
    if (address !== undefined) updateData.address = address;
    
    // If phone is being updated, mark as unverified
    if (phone !== undefined && phone !== req.profile.phone) {
      updateData.phone = phone;
      updateData.phone_verified = false;
    }

    // Validate required fields if they're being updated
    if (updateData.full_name && !updateData.full_name.trim()) {
      return res.status(400).json({
        error: 'Full name cannot be empty'
      });
    }

    if (updateData.zip_code) {
      const zipRegex = /^\d{5}(-\d{4})?$/;
      if (!zipRegex.test(updateData.zip_code)) {
        return res.status(400).json({
          error: 'Invalid ZIP code format'
        });
      }
    }

    if (updateData.phone) {
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(updateData.phone)) {
        return res.status(400).json({
          error: 'Invalid phone number format'
        });
      }
    }

    // Update profile in database
    const { data: updatedProfile, error } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({
        error: 'Profile update failed',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update profile'
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getProfile(req, res);
    case 'PUT':
      return updateProfile(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);