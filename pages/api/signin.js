import { supabaseAdmin, supabaseClient } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Email and password are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Attempt to sign in with Supabase admin (server-side only)
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });
    console.log('authData', authData);
    console.log('authError', authError);
    if (authError) {
      // Handle specific auth errors
      if (authError.message.includes('Invalid login credentials')) {
        return res.status(401).json({
          error: 'Invalid credentials',
          details: 'The email or password you entered is incorrect',
        });
      }

      if (authError.message.includes('Email not confirmed')) {
        return res.status(401).json({
          error: 'Email not verified',
          details:
            'Please check your email and click the verification link before signing in',
        });
      }

      return res.status(400).json({
        error: 'Sign in failed',
        details: authError.message,
      });
    }

    if (!authData.user) {
      return res.status(400).json({
        error: 'Sign in failed',
        details: 'No user data returned',
      });
    }

    // Get user profile information using admin client
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select(
        `
        id,
        full_name,
        display_name,
        email,
        country,
        zip_code,
        phone,
        phone_verified,
        user_type,
        role,
        status,
        registration_date,
        avatar_url,
        email_verified
      `
      )
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        error: 'Profile data unavailable',
        details: 'Could not fetch user profile information',
      });
    }

    // Check if user account is blocked
    if (profile.status === 'blocked') {
      return res.status(403).json({
        error: 'Account blocked',
        details:
          'Your account has been suspended. Please contact support for assistance.',
      });
    }

    // Check if phone verification is required
    if (!profile.phone_verified) {
      return res.status(202).json({
        success: false,
        error: 'Phone verification required',
        details:
          'Please verify your phone number before accessing your account',
        requires_phone_verification: true,
        user_profile: profile,
        temp_session: {
          access_token: authData.session?.access_token,
          refresh_token: authData.session?.refresh_token,
          expires_at: authData.session?.expires_at,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Sign in successful',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
        profile: profile,
      },
      session: {
        access_token: authData.session?.access_token,
        refresh_token: authData.session?.refresh_token,
        expires_at: authData.session?.expires_at,
      },
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during sign in',
    });
  }
}
