import { supabaseAdmin } from '../../../../lib/supabase';
import { requireAdmin } from '../../../../lib/auth-middleware';

// Update listing information (admin only)
async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    const {
      title,
      description,
      category,
      condition,
      price,
      year,
      videoUrl,
      zipCode,
      status
    } = req.body;

    // Check if listing exists
    const { data: existingListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('id, title, user_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingListing) {
      return res.status(404).json({
        error: 'Listing not found'
      });
    }

    // Validate required fields
    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Title and description are required'
      });
    }

    // Validate price
    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({
          error: 'Invalid price',
          details: 'Price must be a valid number greater than or equal to 0'
        });
      }
    }

    // Validate category
    if (category) {
      const validCategories = ['equipment', 'truck', 'business', 'parts'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          error: 'Invalid category',
          details: 'Category must be one of: ' + validCategories.join(', ')
        });
      }
    }

    // Validate condition
    if (condition) {
      const validConditions = ['new', 'excellent', 'good', 'fair', 'poor'];
      if (!validConditions.includes(condition)) {
        return res.status(400).json({
          error: 'Invalid condition',
          details: 'Condition must be one of: ' + validConditions.join(', ')
        });
      }
    }

    // Validate year if provided
    if (year && (isNaN(parseInt(year)) || parseInt(year) < 1900 || parseInt(year) > new Date().getFullYear() + 1)) {
      return res.status(400).json({
        error: 'Invalid year',
        details: 'Year must be between 1900 and next year'
      });
    }

    // Validate status
    if (status) {
      const validStatuses = ['pending', 'active', 'sponsored', 'bubble_binz', 'inactive', 'deleted'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          details: 'Status must be one of: ' + validStatuses.join(', ')
        });
      }
    }

    // Prepare update data
    const updateData = {
      updated_at: new Date().toISOString()
    };

    // Add fields if provided
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (year !== undefined) updateData.year = year ? parseInt(year) : null;
    if (videoUrl !== undefined) updateData.video_url = videoUrl?.trim() || null;
    if (zipCode !== undefined) updateData.zip_code = zipCode?.trim();
    if (status !== undefined) updateData.status = status;

    // Update the listing
    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from('listings')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        listing_images (
          id,
          image_url,
          is_main,
          display_order
        )
      `)
      .single();

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to update listing',
        details: updateError.message
      });
    }

    // Add main image for response
    const listingWithImage = {
      ...updatedListing,
      main_image: updatedListing.listing_images.find(img => img.is_main)?.image_url || null
    };

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: listingWithImage
    });

  } catch (error) {
    console.error('Update listing error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update listing'
    });
  }
}

export default requireAdmin(handler);