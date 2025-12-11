import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessToken, newPassword } = req.body;

    if (!accessToken || !newPassword) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Access token and new password are required',
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Invalid password',
        details: 'Password must be at least 8 characters long',
      });
    }

    // Get user from access token
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(
      accessToken
    );

    if (userError || !userData.user) {
      console.error('Invalid access token:', userError);
      return res.status(401).json({
        error: 'Invalid or expired reset link',
        details: 'Please request a new password reset link',
      });
    }

    // Update the user's password
    const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Password update error:', updateError);
      return res.status(500).json({
        error: 'Failed to update password',
        details: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not reset password',
    });
  }
}
