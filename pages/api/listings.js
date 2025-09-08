import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';
import { Resend } from 'resend';

// Initialize Resend (only if API key is available)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Send admin notification email
const sendAdminNotification = async (listing, userProfile) => {
  if (!resend || !process.env.ADMIN_EMAIL || !process.env.RESEND_FROM_EMAIL) {
    console.log('Email notification skipped - Resend not configured');
    return;
  }

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: 'New Listing Awaiting Approval',
      html: `
        <h2>New Listing Submitted</h2>
        <p>A new listing has been submitted and requires approval:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 16px 0;">
          <h3>${listing.title}</h3>
          <p><strong>Category:</strong> ${listing.category}</p>
          <p><strong>Price:</strong> $${listing.price.toLocaleString()}</p>
          <p><strong>Condition:</strong> ${listing.condition}</p>
          <p><strong>Location:</strong> ${listing.zip_code}</p>
          <p><strong>Submitted by:</strong> ${userProfile.full_name} (${
        userProfile.email
      })</p>
        </div>
        
        <p><strong>Description:</strong></p>
        <p>${listing.description}</p>
        
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin" 
             style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px;">
            Review in Admin Dashboard
          </a>
        </div>
      `,
    });
    console.log('Admin notification sent successfully');
  } catch (error) {
    console.error('Failed to send admin notification:', error);
  }
};

// Create a new listing
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      condition,
      price,
      year,
      videoUrl,
      zipCode,
      images,
    } = req.body;

    const userId = req.user.id;

    // Check if email is verified before allowing listing creation
    if (!req.profile.email_verified) {
      return res.status(403).json({
        error: 'Email verification required',
        details: 'Please verify your email address before creating listings',
      });
    }

    // Validate required fields
    if (
      !title ||
      !description ||
      !category ||
      !condition ||
      !price ||
      !zipCode
    ) {
      return res.status(400).json({
        error: 'Missing required fields',
        details:
          'Title, description, category, condition, price, and ZIP code are required',
      });
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) {
      return res.status(400).json({
        error: 'Invalid price',
        details: 'Price must be a valid number greater than or equal to 0',
      });
    }

    // Validate category
    const validCategories = ['equipment', 'truck', 'business', 'parts'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        error: 'Invalid category',
        details: 'Category must be one of: ' + validCategories.join(', '),
      });
    }

    // Validate condition
    const validConditions = ['new', 'excellent', 'good', 'fair', 'poor'];
    if (!validConditions.includes(condition)) {
      return res.status(400).json({
        error: 'Invalid condition',
        details: 'Condition must be one of: ' + validConditions.join(', '),
      });
    }

    // Validate year if provided
    if (
      year &&
      (isNaN(parseInt(year)) ||
        parseInt(year) < 1900 ||
        parseInt(year) > new Date().getFullYear() + 1)
    ) {
      return res.status(400).json({
        error: 'Invalid year',
        details: 'Year must be between 1900 and next year',
      });
    }

    // Create the listing
    const { data: newListing, error: listingError } = await supabaseAdmin
      .from('listings')
      .insert({
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
        price: priceNum,
        year: year ? parseInt(year) : null,
        video_url: videoUrl || null,
        zip_code: zipCode.trim(),
        status: 'pending', // All new listings start as pending
      })
      .select()
      .single();

    if (listingError) {
      console.error('Listing creation error:', listingError);
      return res.status(500).json({
        error: 'Failed to create listing',
        details: listingError.message,
      });
    }

    // Handle image uploads if provided
    if (images && images.length > 0) {
      const imageInserts = images.map((image, index) => ({
        listing_id: newListing.id,
        image_url: image.url,
        is_main: image.isMain || index === 0,
        display_order: index,
      }));

      const { error: imagesError } = await supabaseAdmin
        .from('listing_images')
        .insert(imageInserts);

      if (imagesError) {
        console.error('Images insertion error:', imagesError);
        // Don't fail the listing creation for image errors
      }
    }

    // Send admin notification email
    try {
      await sendAdminNotification(newListing, req.profile);
    } catch (emailError) {
      console.error('Admin notification error:', emailError);
      // Don't fail listing creation if email fails
    }

    return res.status(201).json({
      success: true,
      message: 'Listing created successfully and is pending approval',
      listing: {
        id: newListing.id,
        title: newListing.title,
        status: newListing.status,
        created_at: newListing.created_at,
      },
    });
  } catch (error) {
    console.error('Create listing error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not create listing',
    });
  }
};

// Get user's listings
const getListings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      limit = 50,
      offset = 0,
      search,
      include_deleted = 'false',
    } = req.query;
    const isAdmin = req.profile.role === 'admin';

    let query = supabaseAdmin
      .from('listings')
      .select(
        `
        *,
        listing_images (
          id,
          image_url,
          is_main,
          display_order
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Exclude deleted listings for regular users unless specifically requested
    if (!isAdmin && include_deleted !== 'true') {
      query = query.is('deleted_at', null);
    }

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Search functionality
    if (search && search.trim()) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    if (offset) {
      query = query.range(
        parseInt(offset),
        parseInt(offset) + parseInt(limit) - 1
      );
    }

    const { data: listings, error } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch listings',
        details: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      listings: listings.map((listing) => ({
        ...listing,
        main_image:
          listing.listing_images.find((img) => img.is_main)?.image_url || null,
        image_count: listing.listing_images.length,
      })),
    });
  } catch (error) {
    console.error('Get listings error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch listings',
    });
  }
};

// Update a listing
const updateListing = async (req, res) => {
  try {
    const { listingId } = req.query;
    const userId = req.user.id;
    const isAdmin = req.profile.role === 'admin';

    const {
      title,
      description,
      category,
      condition,
      price,
      year,
      videoUrl,
      zipCode,
      status,
    } = req.body;

    // Check ownership or admin privileges
    const { data: existingListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('user_id, status')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      return res.status(404).json({
        error: 'Listing not found',
      });
    }

    if (existingListing.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only edit your own listings',
      });
    }

    const updateData = {};

    // Only update provided fields
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (category !== undefined) updateData.category = category;
    if (condition !== undefined) updateData.condition = condition;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (year !== undefined) updateData.year = year ? parseInt(year) : null;
    if (videoUrl !== undefined) updateData.video_url = videoUrl || null;
    if (zipCode !== undefined) updateData.zip_code = zipCode.trim();

    // Only admins can change status
    if (status !== undefined && isAdmin) {
      updateData.status = status;
    }

    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({
        error: 'Failed to update listing',
        details: updateError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Listing updated successfully',
      listing: updatedListing,
    });
  } catch (error) {
    console.error('Update listing error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not update listing',
    });
  }
};

// Soft delete a listing (hide from users, visible to admins)
const deleteListing = async (req, res) => {
  try {
    const { listingId } = req.query;
    const userId = req.user.id;
    const isAdmin = req.profile.role === 'admin';

    // Check ownership or admin privileges
    const { data: existingListing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('user_id, title')
      .eq('id', listingId)
      .single();

    if (fetchError || !existingListing) {
      return res.status(404).json({
        error: 'Listing not found',
      });
    }

    if (existingListing.user_id !== userId && !isAdmin) {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only delete your own listings',
      });
    }

    // Soft delete - set deleted_at timestamp and status to deleted
    const { error: deleteError } = await supabaseAdmin
      .from('listings')
      .update({
        deleted_at: new Date().toISOString(),
        status: 'deleted',
      })
      .eq('id', listingId);

    if (deleteError) {
      return res.status(500).json({
        error: 'Failed to delete listing',
        details: deleteError.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Listing deleted successfully',
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not delete listing',
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getListings(req, res);
    case 'POST':
      return createListing(req, res);
    case 'PUT':
      return updateListing(req, res);
    case 'DELETE':
      return deleteListing(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);
