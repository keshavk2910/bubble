import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth-middleware';

// Add image to listing
const addImage = async (req, res) => {
  try {
    const { listingId } = req.query;
    const { imageUrl, isMain = false, displayOrder = 0 } = req.body;
    const userId = req.user.id;

    // Verify user owns this listing
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({
        error: 'Listing not found'
      });
    }

    if (listing.user_id !== userId && req.profile.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only manage images for your own listings'
      });
    }

    // If this is to be the main image, unset other main images
    if (isMain) {
      await supabaseAdmin
        .from('listing_images')
        .update({ is_main: false })
        .eq('listing_id', listingId);
    }

    // Add new image
    const { data: newImage, error: imageError } = await supabaseAdmin
      .from('listing_images')
      .insert({
        listing_id: listingId,
        image_url: imageUrl,
        is_main: isMain,
        display_order: displayOrder
      })
      .select()
      .single();

    if (imageError) {
      return res.status(500).json({
        error: 'Failed to add image',
        details: imageError.message
      });
    }

    return res.status(201).json({
      success: true,
      image: newImage
    });

  } catch (error) {
    console.error('Add image error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not add image'
    });
  }
};

// Update image (for reordering and main image changes)
const updateImages = async (req, res) => {
  try {
    const { listingId } = req.query;
    const { images } = req.body; // Array of image updates
    const userId = req.user.id;

    // Verify user owns this listing
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({
        error: 'Listing not found'
      });
    }

    if (listing.user_id !== userId && req.profile.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only manage images for your own listings'
      });
    }

    // Update each image's order and main status
    const updatePromises = images.map(image => 
      supabaseAdmin
        .from('listing_images')
        .update({
          is_main: image.isMain,
          display_order: image.displayOrder
        })
        .eq('id', image.id)
        .eq('listing_id', listingId)
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'Images updated successfully'
    });

  } catch (error) {
    console.error('Update images error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update images'
    });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { listingId } = req.query;
    const { imageId } = req.body;
    const userId = req.user.id;

    // Verify user owns this listing
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({
        error: 'Listing not found'
      });
    }

    if (listing.user_id !== userId && req.profile.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only manage images for your own listings'
      });
    }

    // Get image details for storage cleanup
    const { data: imageData, error: imageError } = await supabaseAdmin
      .from('listing_images')
      .select('image_url')
      .eq('id', imageId)
      .eq('listing_id', listingId)
      .single();

    if (imageError || !imageData) {
      return res.status(404).json({
        error: 'Image not found'
      });
    }

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('listing_images')
      .delete()
      .eq('id', imageId)
      .eq('listing_id', listingId);

    if (deleteError) {
      return res.status(500).json({
        error: 'Failed to delete image',
        details: deleteError.message
      });
    }

    // Optionally delete from storage (extract filename from URL)
    try {
      const urlParts = imageData.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      if (fileName) {
        await supabaseAdmin.storage
          .from('listing-images')
          .remove([fileName]);
      }
    } catch (storageError) {
      console.error('Storage cleanup error:', storageError);
      // Don't fail the request if storage cleanup fails
    }

    return res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete image error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not delete image'
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'POST':
      return addImage(req, res);
    case 'PUT':
      return updateImages(req, res);
    case 'DELETE':
      return deleteImage(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);