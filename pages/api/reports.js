import { supabaseAdmin } from '../../lib/supabase';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { listingId, reason, customReason, reporterEmail } = req.body;

    if (!listingId || !reason || !reporterEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Listing ID, reason, and email are required'
      });
    }

    // Validate reason
    const validReasons = ['inappropriate', 'spam', 'misleading', 'pricing', 'prohibited', 'scam', 'other'];
    if (!validReasons.includes(reason)) {
      return res.status(400).json({ 
        error: 'Invalid reason',
        details: 'Reason must be one of: ' + validReasons.join(', ')
      });
    }

    // If reason is 'other', custom reason is required
    if (reason === 'other' && (!customReason || !customReason.trim())) {
      return res.status(400).json({ 
        error: 'Custom reason required',
        details: 'Please provide additional details when selecting "Other"'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(reporterEmail)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        details: 'Please provide a valid email address'
      });
    }

    // Check if listing exists
    const { data: listing, error: listingError } = await supabaseAdmin
      .from('listings')
      .select('id, title, status')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      return res.status(404).json({ 
        error: 'Listing not found',
        details: 'The listing you are trying to report does not exist'
      });
    }

    // Get user ID if authenticated
    let reporterUserId = null;
    const authHeader = req.headers.authorization;
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
        
        if (!userError && userData.user) {
          reporterUserId = userData.user.id;
        }
      } catch (authError) {
        // Continue without user ID if auth fails
        console.log('Auth check failed for report, continuing anonymously');
      }
    }

    // Create the report
    const { data: newReport, error: reportError } = await supabaseAdmin
      .from('reports')
      .insert({
        listing_id: listingId,
        reporter_user_id: reporterUserId,
        reporter_email: reporterEmail,
        reason: reason,
        custom_reason: reason === 'other' ? customReason.trim() : null,
        status: 'pending'
      })
      .select(`
        *,
        listing:listings(
          id,
          title,
          status,
          slug,
          display_id
        ),
        reporter:user_profiles!reports_reporter_user_id_fkey(
          id,
          full_name,
          display_name,
          email
        )
      `)
      .single();

    if (reportError) {
      console.error('Report creation error:', reportError);
      return res.status(500).json({ 
        error: 'Failed to create report',
        details: reportError.message 
      });
    }

    // TODO: Send notification email to admins about new report
    console.log('New report submitted:', {
      reportId: newReport.id,
      listingTitle: listing.title,
      reason: reason,
      reporterEmail: reporterEmail
    });

    res.status(201).json({ 
      success: true,
      message: 'Report submitted successfully',
      report: newReport
    });

  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: 'Failed to submit report'
    });
  }
}