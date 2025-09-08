import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/auth-middleware';

// Update user profile information (admin only)
async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const {
      full_name,
      display_name,
      email,
      phone,
      country,
      zip_code,
      address,
      user_type,
      status
    } = req.body;

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('id', id)
      .single();

    if (fetchError || !existingUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Validate required fields
    if (!full_name?.trim() || !email?.trim()) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Full name and email are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: 'Please provide a valid email address'
      });
    }

    // Check if email is already taken by another user
    if (email.trim().toLowerCase() !== existingUser.email.toLowerCase()) {
      const { data: emailExists } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .neq('id', id)
        .single();

      if (emailExists) {
        return res.status(400).json({
          error: 'Email already exists',
          details: 'This email address is already registered by another user'
        });
      }
    }

    // Validate user type
    const validUserTypes = ['customer', 'service_provider'];
    if (user_type && !validUserTypes.includes(user_type)) {
      return res.status(400).json({
        error: 'Invalid user type',
        details: 'User type must be either customer or service_provider'
      });
    }

    // Validate status
    const validStatuses = ['active', 'blocked'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        details: 'Status must be either active or blocked'
      });
    }

    // Prepare update data
    const updateData = {
      full_name: full_name.trim(),
      email: email.trim().toLowerCase(),
      updated_at: new Date().toISOString()
    };

    // Add optional fields if provided
    if (display_name !== undefined) {
      updateData.display_name = display_name?.trim() || null;
    }
    if (phone !== undefined) {
      updateData.phone = phone?.trim() || null;
    }
    if (country !== undefined) {
      updateData.country = country || null;
    }
    if (zip_code !== undefined) {
      updateData.zip_code = zip_code?.trim() || null;
    }
    if (address !== undefined) {
      updateData.address = address?.trim() || null;
    }
    if (user_type !== undefined) {
      updateData.user_type = user_type;
    }
    if (status !== undefined) {
      updateData.status = status;
    }

    // Update the user profile
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to update user',
        details: updateError.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update user profile'
    });
  }
}

export default requireAdmin(handler);