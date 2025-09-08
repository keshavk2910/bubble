import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';
import { Resend } from 'resend';

// Initialize Resend (only if API key is available)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Send email verification OTP
const sendEmailVerificationOTP = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user.id;
    const userEmail = req.profile.email;

    // Generate and store OTP in database
    const { data: otpData, error: otpError } = await supabaseAdmin.rpc(
      'generate_verification_code',
      {
        p_user_id: userId,
        p_code_type: 'email',
        p_email: userEmail,
      }
    );

    if (otpError) {
      console.error('OTP generation error:', otpError);
      return res.status(500).json({
        error: 'Failed to generate verification code',
        details: otpError.message,
      });
    }

    const otp = otpData;

    // For demo purposes, log OTP to console
    console.log(`Email verification OTP for ${userEmail}: ${otp}`);

    if (!resend || !process.env.RESEND_FROM_EMAIL) {
      console.log(
        'Email verification OTP sent (simulated - no Resend configured)'
      );
      return res.status(200).json({
        success: true,
        message: 'Verification code sent to your email',
        // Remove this in production - only for demo
        otp: otp,
        expiresIn: 600, // 10 minutes
      });
    }

    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL,
        to: userEmail,
        subject: 'Email Verification - Bin Cleaning Classifieds',
        html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h2 style="color: #16a34a; text-align: center;">Email Verification</h2>
            <p>Hello ${req.profile.full_name || 'User'},</p>
            
            <p>Thank you for using Bin Cleaning Classifieds. Please use the following verification code to verify your email address:</p>
            
            <div style="background: #f8f9fa; border: 2px dashed #16a34a; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h3 style="font-size: 32px; color: #16a34a; margin: 0; letter-spacing: 8px;">${otp}</h3>
            </div>
            
            <p style="color: #666; font-size: 14px;">
              This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                Bin Cleaning Classifieds - The premier marketplace for pressure washing and bin cleaning businesses.
              </p>
            </div>
          </div>
        `,
      });
      console.log('Email verification OTP sent successfully');
    } catch (emailError) {
      console.error('Failed to send email verification:', emailError);
      // Still return success since OTP was generated
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      // Show OTP in development mode only
      ...(process.env.SHOW_OTP_IN_DEV === 'true' && {
        otp: otp,
        dev_mode: true,
      }),
      expiresIn: 600, // 10 minutes
    });
  } catch (error) {
    console.error('Email verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not send verification email',
    });
  }
};

// Verify email OTP
const verifyEmailOTP = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { otp } = req.body;
    const userId = req.user.id;

    if (!otp || !/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: 'Invalid OTP format',
        details: 'OTP must be 6 digits',
      });
    }

    // Verify OTP against stored value in database
    const { data: isValidOTP, error: verifyError } = await supabaseAdmin.rpc(
      'verify_code',
      {
        p_user_id: userId,
        p_code: otp,
        p_code_type: 'email',
      }
    );

    if (verifyError) {
      console.error('OTP verification error:', verifyError);
      return res.status(500).json({
        error: 'Verification failed',
        details: 'Could not verify code',
      });
    }

    if (!isValidOTP) {
      return res.status(400).json({
        error: 'Invalid or expired code',
        details: 'Please check your code or request a new one',
      });
    }

    // Update user profile to mark email as verified
    const { error: updateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        email_verified: true,
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Email verification update error:', updateError);
      return res.status(500).json({
        error: 'Verification failed',
        details: 'Could not update email verification status',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email OTP verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not verify email',
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return sendEmailVerificationOTP(req, res);
    case 'PUT':
      return verifyEmailOTP(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
