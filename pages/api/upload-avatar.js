import { supabaseAdmin } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Create client with user's session for RLS
const createUserSupabase = (userToken) => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: {
        headers: {
          Authorization: `Bearer ${userToken}`
        }
      }
    }
  );
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    // Create user-authenticated Supabase client for RLS compliance
    const userSupabase = createUserSupabase(token);

    const { file, fileName, fileType } = req.body;

    if (!file || !fileName || !fileType) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'File data, name, and type are required'
      });
    }

    // Validate file type
    if (!fileType.startsWith('image/')) {
      return res.status(400).json({ 
        error: 'Invalid file type',
        details: 'Only image files are allowed'
      });
    }

    // Convert base64 to buffer
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size (max 5MB)
    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(400).json({ 
        error: 'File too large',
        details: 'Avatar must be less than 5MB'
      });
    }

    // Generate unique filename
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${userData.user.id}/${Date.now()}-avatar.${fileExtension}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('user-avatars')
      .upload(uniqueFileName, buffer, {
        contentType: fileType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase storage error:', uploadError);
      return res.status(500).json({ 
        error: 'Upload failed',
        details: uploadError.message 
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('user-avatars')
      .getPublicUrl(uniqueFileName);

    const avatarUrl = publicUrlData.publicUrl;

    // Update user profile with new avatar URL using user's authenticated session
    const { error: updateError } = await userSupabase
      .from('user_profiles')
      .update({ 
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user.id);

    if (updateError) {
      console.error('Profile update error:', updateError);
      // Try to clean up uploaded file
      await supabaseAdmin.storage
        .from('user-avatars')
        .remove([uniqueFileName]);
      
      return res.status(500).json({ 
        error: 'Failed to update profile',
        details: updateError.message 
      });
    }

    res.status(200).json({ 
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: 'Avatar upload failed'
    });
  }
}