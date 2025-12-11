import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing required field',
        details: 'Email address is required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        details: 'Please enter a valid email address',
      });
    }

    // Check if user exists (optional - for security, we might want to always return success)
    const { data: user, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    // For security, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Determine the redirect URL based on environment
    const redirectUrl = process.env.NODE_ENV === 'production'
      ? 'https://binsbuysell.com/reset-password'
      : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`;

    console.log(`Generating password reset link with redirect to: ${redirectUrl}`);

    // Use Supabase Auth to send password reset email
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error('Password reset link generation error:', error);
      return res.status(500).json({
        error: 'Failed to generate reset link',
        details: error.message,
      });
    }

    console.log(`Password reset link generated for ${email}:`, data.properties.action_link);

    // Send email via Mailgun
    if (process.env.MAILGUN_API_KEY && process.env.MAILGUN_DOMAIN) {
      try {
        const formData = require('form-data');
        const Mailgun = require('mailgun.js');
        const mailgun = new Mailgun(formData);
        const mg = mailgun.client({
          username: 'api',
          key: process.env.MAILGUN_API_KEY,
        });

        await mg.messages.create(process.env.MAILGUN_DOMAIN, {
          from: process.env.MAILGUN_FROM_EMAIL,
          to: [email],
          subject: 'Reset Your Password - Bins Buy Sell',
          html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <h2 style="color: #16a34a; text-align: center;">Reset Your Password</h2>
              <p>Hello,</p>

              <p>We received a request to reset your password for your Bins Buy Sell account.</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.properties.action_link}"
                   style="background: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 500;">
                  Reset Password
                </a>
              </div>

              <p style="color: #666; font-size: 14px;">
                This link will expire in 1 hour. If you didn't request this password reset, please ignore this email.
              </p>

              <p style="color: #666; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${data.properties.action_link}" style="color: #16a34a; word-break: break-all;">
                  ${data.properties.action_link}
                </a>
              </p>

              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="color: #999; font-size: 12px; text-align: center;">
                  Bins Buy Sell - The premier marketplace for pressure washing and bin cleaning businesses.
                </p>
              </div>
            </div>
          `,
        });

        console.log(`Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        // Still return success to user
      }
    } else {
      // Log the reset link for development
      console.log(`Password reset link for ${email}:`, data.properties.action_link);
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not process password reset request',
    });
  }
}
