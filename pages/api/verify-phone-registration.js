import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { method } = req;

    if (method === 'POST') {
      // Send OTP for registration phone verification
      const { userId, phone } = req.body;

      if (!userId || !phone) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'User ID and phone number are required',
        });
      }

      // Verify user exists and is not yet phone verified
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, phone, phone_verified')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Generate and store OTP in database
      const { data: otpData, error: otpError } = await supabaseAdmin.rpc(
        'generate_verification_code',
        {
          p_user_id: userId,
          p_code_type: 'phone',
          p_phone: phone,
        }
      );

      if (otpError) {
        console.error('Registration phone OTP generation error:', otpError);
        return res.status(500).json({
          error: 'Failed to generate verification code',
          details: otpError.message,
        });
      }

      const otp = otpData;

      console.log(
        `Registration SMS to ${phone}: Your verification code is ${otp}`
      );

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        // Show OTP when flag is set
        ...(process.env.SHOW_OTP_IN_DEV && {
          otp: otp,
          dev_mode: true,
        }),
        expiresIn: 300, // 5 minutes
      });
    } else if (method === 'PUT') {
      // Verify OTP for registration
      const { userId, otp, phone } = req.body;

      if (!userId || !otp || !phone) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'User ID, OTP, and phone number are required',
        });
      }

      // Validate OTP format
      if (!/^\d{6}$/.test(otp)) {
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
          p_code_type: 'phone',
        }
      );

      if (verifyError) {
        console.error(
          'Registration phone OTP verification error:',
          verifyError
        );
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

      // Update user profile to mark phone as verified
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          phone_verified: true,
          phone: phone,
        })
        .eq('id', userId);

      if (updateError) {
        console.error(
          'Registration phone verification update error:',
          updateError
        );
        return res.status(500).json({
          error: 'Verification failed',
          details: 'Could not update phone verification status',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Phone number verified successfully',
      });
    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Registration phone verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during phone verification',
    });
  }
}
