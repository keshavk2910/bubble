import { supabaseAdmin } from '../../lib/supabase';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Country code to dial code mapping
const COUNTRY_DIAL_CODES = {
  US: '+1',  // United States
  CA: '+1',  // Canada
  GB: '+44', // United Kingdom
  AU: '+61', // Australia
  IN: '+91', // India
  DE: '+49', // Germany
  FR: '+33', // France
  JP: '+81', // Japan
  CN: '+86', // China
  BR: '+55', // Brazil
  MX: '+52', // Mexico
  IT: '+39', // Italy
  ES: '+34', // Spain
  NL: '+31', // Netherlands
  SE: '+46', // Sweden
  NO: '+47', // Norway
  DK: '+45', // Denmark
  FI: '+358', // Finland
  NZ: '+64', // New Zealand
  SG: '+65', // Singapore
  // Add more countries as needed
};

// Helper function to normalize phone number to E.164 format
function normalizePhoneNumber(phone, countryCode = 'US') {
  // If it already has +, return as is
  if (phone.startsWith('+')) {
    return phone;
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Get dial code for the country
  const dialCode = COUNTRY_DIAL_CODES[countryCode] || '+1'; // Default to US

  // If number already includes country code, just add +
  const dialCodeDigits = dialCode.replace('+', '');
  if (cleaned.startsWith(dialCodeDigits)) {
    return `+${cleaned}`;
  }

  // Add country dial code
  return `${dialCode}${cleaned}`;
}

export default async function handler(req, res) {
  try {
    const { method } = req;

    if (method === 'POST') {
      // Send OTP for registration phone verification
      const { userId, phone, country } = req.body;

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

      // Normalize phone number to E.164 format using country code
      const normalizedPhone = normalizePhoneNumber(phone, country || 'US');

      console.log(`Normalizing ${phone} with country ${country || 'US'} -> ${normalizedPhone}`);

      // Send OTP via Twilio Verify
      try {
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({
            to: normalizedPhone,
            channel: 'sms',
          });

        console.log(
          `Registration Twilio verification sent to ${phone}, status: ${verification.status}`
        );

        return res.status(200).json({
          success: true,
          message: 'Verification code sent successfully',
          status: verification.status, // 'pending'
        });
      } catch (twilioError) {
        console.error('Registration Twilio verification error:', twilioError);
        return res.status(500).json({
          error: 'Failed to send verification code',
          details: twilioError.message,
        });
      }
    } else if (method === 'PUT') {
      // Verify OTP for registration
      const { userId, otp, phone, country } = req.body;

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

      // Normalize phone number to E.164 format using country code
      const normalizedPhone = normalizePhoneNumber(phone, country || 'US');

      // Verify OTP using Twilio Verify
      try {
        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: normalizedPhone,
            code: otp,
          });

        console.log(
          `Registration Twilio verification check for ${phone}, status: ${verificationCheck.status}`
        );

        // Check if verification was approved
        if (verificationCheck.status !== 'approved') {
          return res.status(400).json({
            error: 'Invalid or expired code',
            details: 'Please check your code or request a new one',
          });
        }
      } catch (twilioError) {
        console.error(
          'Registration Twilio verification check error:',
          twilioError
        );

        // Handle specific Twilio errors
        if (twilioError.code === 20404) {
          return res.status(400).json({
            error: 'Invalid or expired code',
            details: 'Please check your code or request a new one',
          });
        }

        return res.status(500).json({
          error: 'Verification failed',
          details: twilioError.message,
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
