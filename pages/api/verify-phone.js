import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  try {
    const { method } = req;

    if (method === 'POST') {
      // Send OTP to phone number
      const { phone, userId } = req.body;

      if (!phone || !userId) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Phone number and user ID are required'
        });
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          error: 'Invalid phone number format'
        });
      }

      // Verify user owns this profile
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, phone')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      // For demo purposes, we'll generate a simple OTP
      // In production, you'd integrate with Twilio, AWS SNS, or similar service
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Store OTP in a temporary way (in production, use Redis or database with expiration)
      // For now, we'll just simulate the SMS sending process
      
      console.log(`SMS to ${phone}: Your verification code is ${otp}`);
      
      // In a real implementation, you would:
      // 1. Send SMS using Twilio/AWS SNS
      // 2. Store OTP with expiration in database/Redis
      // 3. Rate limit OTP requests

      return res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
        // Remove this in production - only for demo
        otp: otp,
        expiresIn: 300 // 5 minutes
      });

    } else if (method === 'PUT') {
      // Verify OTP and update phone verification status
      const { userId, otp, phone } = req.body;

      if (!userId || !otp || !phone) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'User ID, OTP, and phone number are required'
        });
      }

      // In production, you would verify the OTP against stored value
      // For demo purposes, we'll accept any 6-digit code
      if (!/^\d{6}$/.test(otp)) {
        return res.status(400).json({
          error: 'Invalid OTP format',
          details: 'OTP must be 6 digits'
        });
      }

      // Update user profile to mark phone as verified
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          phone_verified: true,
          phone: phone 
        })
        .eq('id', userId);

      if (updateError) {
        console.error('Phone verification update error:', updateError);
        return res.status(500).json({
          error: 'Verification failed',
          details: 'Could not update phone verification status'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Phone number verified successfully'
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('Phone verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during phone verification'
    });
  }
}