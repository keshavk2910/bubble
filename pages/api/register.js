import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, email, password, country, zipCode, phone } = req.body;

    // Validate required fields
    if (!fullName || !email || !password || !country || !zipCode || !phone) {
      return res.status(400).json({
        error: 'Missing required fields',
        details:
          'Full name, email, password, country, ZIP code, and phone are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    // Validate ZIP code format
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(zipCode)) {
      return res.status(400).json({
        error: 'Invalid ZIP code format. Use 12345 or 12345-6789 format',
      });
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        error: 'Invalid phone number format',
      });
    }

    let authData;

    try {
      // Create auth user with Supabase
      const authResult = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for server-side creation
        user_metadata: {
          full_name: fullName,
        },
      });

      authData = authResult.data;
      const authError = authResult.error;

      if (authError) {
        console.error('Auth creation error:', authError);
        return res.status(400).json({
          error: 'Registration failed',
          details: authError.message,
        });
      }

      if (!authData.user) {
        return res.status(400).json({
          error: 'Registration failed',
          details: 'No user data returned from auth creation',
        });
      }

      // Create user profile manually (instead of relying on trigger)
      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          full_name: fullName,
          email: email,
          country,
          zip_code: zipCode,
          phone,
          display_name: fullName,
          user_type: 'customer',
          role: 'user',
          status: 'active',
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);

        // If profile creation fails, clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);

        return res.status(400).json({
          error: 'Registration failed',
          details: 'Could not create user profile',
        });
      }

    } catch (createError) {
      console.error('User creation error:', createError);
      return res.status(400).json({
        error: 'Registration failed',
        details: 'Database error creating new user',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful. Account created and ready to use!',
      user: {
        id: authData.user?.id,
        email: authData.user?.email,
        emailConfirmed: authData.user?.email_confirmed_at ? true : false,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during registration',
    });
  }
}
