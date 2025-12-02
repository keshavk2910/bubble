import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Increase body size limit to 10MB to handle base64 encoded images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, fileName, contentType } = req.body;

    if (!image || !fileName) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Image data and fileName are required'
      });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(contentType)) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: 'Only JPEG, PNG, and GIF images are allowed'
      });
    }

    // Create unique filename with user ID folder structure
    const userId = req.user.id;
    const timestamp = Date.now();
    const fileExtension = fileName.split('.').pop();
    const uniqueFileName = `${userId}/${timestamp}-${fileName}`;

    // Convert base64 to buffer (assuming image is base64 encoded)
    let imageBuffer;
    try {
      // Remove data URL prefix if present
      const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
      imageBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid image data',
        details: 'Image must be valid base64 encoded data'
      });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (imageBuffer.length > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        details: 'Image must be smaller than 5MB'
      });
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('listing-images')
      .upload(uniqueFileName, imageBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Image upload error:', uploadError);
      return res.status(500).json({
        error: 'Upload failed',
        details: uploadError.message
      });
    }

    // Get public URL for the uploaded image
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('listing-images')
      .getPublicUrl(uniqueFileName);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully',
      image: {
        url: publicUrlData.publicUrl,
        fileName: uniqueFileName,
        size: imageBuffer.length,
        contentType
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not upload image'
    });
  }
});