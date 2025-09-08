import { supabaseAdmin } from '../../lib/supabase';
import { requireAuth } from '../../lib/auth-middleware';

// Get user notifications
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, unread_only = false } = req.query;

    let query = supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (unread_only === 'true') {
      query = query.eq('read', false);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: notifications, error } = await query;

    if (error) {
      return res.status(500).json({
        error: 'Failed to fetch notifications',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      notifications
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch notifications'
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    const userId = req.user.id;

    if (!notificationId) {
      return res.status(400).json({
        error: 'Missing notification ID'
      });
    }

    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ 
        read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      return res.status(500).json({
        error: 'Failed to mark as read',
        details: error.message
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not mark notification as read'
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const { count } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    return res.status(200).json({
      success: true,
      unreadCount: count || 0
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not get unread count'
    });
  }
};

async function handler(req, res) {
  const { method } = req;

  switch (method) {
    case 'GET':
      return getNotifications(req, res);
    case 'PUT':
      return markAsRead(req, res);
    case 'POST':
      return getUnreadCount(req, res);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

export default requireAuth(handler);