import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Increase body size limit to 20MB to handle base64 encoded images
// Base64 encoding increases file size by ~33%, so 5MB image becomes ~6.7MB
// 20MB allows comfortable headroom for multiple large images
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '20mb',
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

    // Validate file type - only allow specific formats (no Apple HEIC/HEIF)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const fileExtension = fileName.toLowerCase().split('.').pop();
    const isWebPByExtension = fileExtension === 'webp';
    
    // Allow WebP files even if content type is not properly detected
    const isValidType = allowedTypes.includes(contentType.toLowerCase()) || 
                       (isWebPByExtension && contentType.includes('image'));
    
    if (!isValidType) {
      return res.status(400).json({
        error: 'Invalid file type',
        details: `Only JPG, PNG, WEBP, and GIF images are allowed. Received: ${contentType} for file: ${fileName}. Apple HEIC/HEIF formats are not supported.`
      });
    }
    
    // Correct content type for WebP files if needed
    const correctedContentType = isWebPByExtension ? 'image/webp' : contentType;

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

    // Validate file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (imageBuffer.length > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        details: 'Image must be smaller than 20MB'
      });
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('listing-images')
      .upload(uniqueFileName, imageBuffer, {
        contentType: correctedContentType,
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
        contentType: correctedContentType
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