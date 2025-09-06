export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // For logout, we primarily handle it client-side by clearing localStorage
    // The JWT tokens will naturally expire, and RLS policies will prevent access
    
    // We could optionally invalidate the session server-side if needed
    // but for now, client-side cleanup is sufficient and more efficient

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'An unexpected error occurred during logout'
    });
  }
}