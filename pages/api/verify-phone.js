import { supabaseAdmin } from '../../lib/supabase';
import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Country code to dial code mapping
const COUNTRY_DIAL_CODES = {
  US: '+1',   // United States
  CA: '+1',   // Canada  
  GB: '+44',  // United Kingdom
  AU: '+61',  // Australia
  IN: '+91',  // India
  DE: '+49',  // Germany
  FR: '+33',  // France
  JP: '+81',  // Japan
  CN: '+86',  // China
  BR: '+55',  // Brazil
  MX: '+52',  // Mexico
  IT: '+39',  // Italy
  ES: '+34',  // Spain
  NL: '+31',  // Netherlands
  SE: '+46',  // Sweden
  NO: '+47',  // Norway
  DK: '+45',  // Denmark
  FI: '+358', // Finland
  NZ: '+64',  // New Zealand
  SG: '+65',  // Singapore
  // Add more countries as needed
};

// Helper function to normalize phone number to E.164 format
function normalizePhoneNumber(phone, countryCode = 'US') {
  if (!phone) return null;
  
  // If it already has +, validate and return
  if (phone.startsWith('+')) {
    const cleaned = phone.replace(/[^+\d]/g, '');
    // Basic validation for E.164 format (+ followed by 7-15 digits)
    if (/^\+\d{7,15}$/.test(cleaned)) {
      return cleaned;
    }
    // If invalid format, remove + and reprocess
    return normalizePhoneNumber(phone.substring(1), countryCode);
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (!cleaned) return null;

  // Get dial code for the country
  const dialCode = COUNTRY_DIAL_CODES[countryCode] || '+1'; // Default to US
  const dialCodeDigits = dialCode.replace('+', '');

  // Check if number already includes country code
  // For single digit country codes like +1, need more careful checking
  if (dialCode === '+1' && cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  // For multi-digit country codes
  else if (dialCode !== '+1' && cleaned.startsWith(dialCodeDigits)) {
    return `+${cleaned}`;
  }
  // For US/CA numbers without country code (10 digits)
  else if (dialCode === '+1' && cleaned.length === 10) {
    return `${dialCode}${cleaned}`;
  }
  // For other countries, add country code if number doesn't already have it
  else if (!cleaned.startsWith(dialCodeDigits)) {
    return `${dialCode}${cleaned}`;
  }
  
  // Fallback: add country code
  return `${dialCode}${cleaned}`;
}

export default async function handler(req, res) {
  try {
    const { method } = req;

    if (method === 'POST') {
      // Send OTP to phone number
      const { phone, userId } = req.body;

      if (!phone || !userId) {
        return res.status(400).json({
          error: 'Missing required fields',
          details: 'Phone number and user ID are required',
        });
      }

      // Validate phone number format
      const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({
          error: 'Invalid phone number format',
        });
      }

      // Verify user owns this profile and get their country
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('id, phone, country')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        return res.status(404).json({
          error: 'User not found',
        });
      }

      // Normalize phone number to E.164 format using user's country
      const normalizedPhone = normalizePhoneNumber(phone, profile.country || 'US');

      console.log(`Normalizing ${phone} with country ${profile.country || 'US'} -> ${normalizedPhone}`);

      // Validate normalized phone number
      if (!normalizedPhone) {
        return res.status(400).json({
          error: 'Invalid phone number',
          details: 'Could not format phone number properly'
        });
      }

      // Send OTP via Twilio Verify
      try {
        console.log(`Attempting to send SMS to normalized number: ${normalizedPhone}`);
        
        const verification = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verifications.create({
            to: normalizedPhone,
            channel: 'sms',
          });

        console.log(
          `Twilio verification sent to ${normalizedPhone} (original: ${phone}), status: ${verification.status}`
        );

        return res.status(200).json({
          success: true,
          message: 'Verification code sent successfully',
          status: verification.status, // 'pending'
          debug: {
            originalPhone: phone,
            normalizedPhone: normalizedPhone,
            country: profile.country
          }
        });
      } catch (twilioError) {
        console.error('Twilio verification error:', {
          error: twilioError,
          phone: phone,
          normalizedPhone: normalizedPhone,
          country: profile.country,
          errorCode: twilioError.code,
          errorMessage: twilioError.message
        });
        
        // Provide more specific error messages
        let errorMessage = 'Failed to send verification code';
        if (twilioError.code === 21211) {
          errorMessage = 'Invalid phone number format';
        } else if (twilioError.code === 21408) {
          errorMessage = 'Permission denied. Phone number may not support SMS';
        } else if (twilioError.code === 21612) {
          errorMessage = 'Phone number is not a valid mobile number';
        }
        
        return res.status(500).json({
          error: errorMessage,
          details: twilioError.message,
          debug: {
            originalPhone: phone,
            normalizedPhone: normalizedPhone,
            country: profile.country,
            twilioCode: twilioError.code
          }
        });
      }
    } else if (method === 'PUT') {
      // Verify OTP and update phone verification status
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

      // Get user's country from database
      const { data: userProfile, error: userError } = await supabaseAdmin
        .from('user_profiles')
        .select('country')
        .eq('id', userId)
        .single();

      const userCountry = userProfile?.country || 'US';

      // Normalize phone number to E.164 format using user's country
      const normalizedPhone = normalizePhoneNumber(phone, userCountry);

      // Verify OTP using Twilio Verify
      try {
        const verificationCheck = await twilioClient.verify.v2
          .services(process.env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({
            to: normalizedPhone,
            code: otp,
          });

        console.log(`Twilio verification check for ${phone}, status: ${verificationCheck.status}`);

        // Check if verification was approved
        if (verificationCheck.status !== 'approved') {
          return res.status(400).json({
            error: 'Invalid or expired code',
            details: 'Please check your code or request a new one',
          });
        }
      } catch (twilioError) {
        console.error('Twilio verification check error:', twilioError);

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
        console.error('Phone verification update error:', updateError);
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
    console.error('Phone verification error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during phone verification',
    });
  }
}
