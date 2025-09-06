import { supabaseAdmin, verifyServerToken } from './supabase';

// Middleware to check if user is authenticated
export const requireAuth = (handler) => {
  return async (req, res) => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'No valid authorization token provided'
        });
      }

      const token = authHeader.replace('Bearer ', '');

      // Verify the JWT token with Supabase
      const { user, error } = await verifyServerToken(token);

      if (error || !user) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'Invalid or expired token'
        });
      }

      // Get user profile to check status and role
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return res.status(401).json({
          error: 'Unauthorized',
          details: 'User profile not found'
        });
      }

      // Check if user account is blocked
      if (profile.status === 'blocked') {
        return res.status(403).json({
          error: 'Account blocked',
          details: 'Your account has been suspended. Please contact support.'
        });
      }

      // Add user and profile to request object
      req.user = user;
      req.profile = profile;

      // Continue to the actual handler
      return handler(req, res);

    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({
        error: 'Internal server error',
        details: 'Authentication check failed'
      });
    }
  };
};

// Middleware to check if user is admin
export const requireAdmin = (handler) => {
  return requireAuth(async (req, res) => {
    if (req.profile.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        details: 'Admin access required'
      });
    }

    return handler(req, res);
  });
};

// Middleware to check if user owns the resource
export const requireOwnership = (resourceIdParam = 'id') => {
  return (handler) => {
    return requireAuth(async (req, res) => {
      const resourceId = req.query[resourceIdParam];
      
      if (!resourceId) {
        return res.status(400).json({
          error: 'Bad request',
          details: 'Resource ID is required'
        });
      }

      // Check if user owns the resource (listing)
      const { data: listing, error: listingError } = await supabaseAdmin
        .from('listings')
        .select('user_id')
        .eq('id', resourceId)
        .single();

      if (listingError || !listing) {
        return res.status(404).json({
          error: 'Resource not found'
        });
      }

      if (listing.user_id !== req.user.id && req.profile.role !== 'admin') {
        return res.status(403).json({
          error: 'Forbidden',
          details: 'You can only access your own resources'
        });
      }

      return handler(req, res);
    });
  };
};

// Helper function to extract user from request in client-side
export const getServerSideAuth = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { user: null, profile: null, error: 'No authorization header' };
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { user: null, profile: null, error: 'Invalid token' };
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return { user, profile: null, error: 'Profile not found' };
    }

    return { user, profile, error: null };
  } catch (error) {
    return { user: null, profile: null, error: error.message };
  }
};