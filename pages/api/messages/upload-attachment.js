import { supabaseAdmin } from '../../../lib/supabase';
import { requireAuth } from '../../../lib/auth-middleware';

export default requireAuth(async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, conversationId } = req.body;
    const userId = req.user.id;

    if (!file || !conversationId) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'File and conversation ID are required'
      });
    }

    // Verify user has access to this conversation
    const { data: conversation, error: conversationError } = await supabaseAdmin
      .from('conversations')
      .select('buyer_id, seller_id')
      .eq('id', conversationId)
      .single();

    if (conversationError || !conversation) {
      return res.status(404).json({
        error: 'Conversation not found'
      });
    }

    if (conversation.buyer_id !== userId && conversation.seller_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        details: 'You can only upload attachments to your own conversations'
      });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${userId}/${conversationId}/${timestamp}-${file.name}`;

    // Convert base64 to buffer (assuming file is base64 encoded)
    let fileBuffer;
    try {
      const base64Data = file.data.replace(/^data:image\/[a-z]+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid file data',
        details: 'File must be valid base64 encoded data'
      });
    }

    // Validate file size (max 10MB for images)
    const maxSize = 10 * 1024 * 1024;
    if (fileBuffer.length > maxSize) {
      return res.status(400).json({
        error: 'File too large',
        details: 'Image must be smaller than 10MB'
      });
    }

    // Upload to Supabase storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('message-attachments')
      .upload(uniqueFileName, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Attachment upload error:', uploadError);
      return res.status(500).json({
        error: 'Upload failed',
        details: uploadError.message
      });
    }

    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('message-attachments')
      .getPublicUrl(uniqueFileName);

    return res.status(200).json({
      success: true,
      attachment: {
        id: uploadData.path,
        file_url: publicUrlData.publicUrl,
        file_name: file.name,
        file_type: file.type,
        file_size: fileBuffer.length
      }
    });

  } catch (error) {
    console.error('Upload attachment error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not upload attachment'
    });
  }
});