# Supabase Setup Instructions

## Environment Variables Setup

To complete the authentication system setup, you need to add your Supabase service role key to the environment variables.

### Step 1: Get Your Service Role Key

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to your project: `skvljznscexezrmzmgnr`
3. Go to Settings → API
4. Copy the `service_role` key (NOT the anon key)

### Step 2: Update Environment Variables

Open `/Users/keshavkewlani/Downloads/bubble/.env.local` and replace:

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

With your actual service role key.

## Security Configuration

### Current Setup:
- ✅ **Server-side only**: All database operations use service role key on server
- ✅ **Frontend isolation**: No direct database access from frontend
- ✅ **API layer**: All data flows through protected API endpoints
- ✅ **Environment variables**: Credentials stored securely in .env.local

### Security Features:
- **supabaseAdmin**: Server-side client with full database access
- **supabaseClient**: Frontend client limited to auth operations only
- **JWT verification**: Proper token validation on all protected routes
- **RLS policies**: Database-level security for all tables
- **Account status checking**: Blocked users prevented from accessing system

## API Endpoints Available:

### Authentication:
- `POST /api/register` - User registration with profile creation
- `POST /api/signin` - User authentication with session management
- `POST /api/signout` - Secure session termination
- `GET /api/me` - Current user information with stats

### Profile Management:
- `GET /api/profile` - Get user profile data
- `PUT /api/profile` - Update user profile information

### Phone Verification:
- `POST /api/verify-phone` - Send OTP to phone number
- `PUT /api/verify-phone` - Verify OTP and mark phone as verified

### Middleware:
- `requireAuth` - Protect routes requiring authentication
- `requireAdmin` - Admin-only route protection
- `requireOwnership` - Resource ownership verification

## Database Schema:

### Tables Created:
- ✅ **user_profiles** - Complete user information
- ✅ **listings** - Marketplace listings with status workflow
- ✅ **listing_images** - Multi-image support with main image logic
- ✅ **wishlists** - User saved listings functionality
- ✅ **conversations** - Buyer-seller communication threads
- ✅ **messages** - Real-time messaging with read status

### Storage Buckets:
- ✅ **listing-images** - Public bucket for listing photos
- ✅ **user-avatars** - Public bucket for profile pictures

## Next Steps:

1. Add your service role key to `.env.local`
2. Test registration and signin flows
3. Implement user dashboard
4. Add listing creation functionality
5. Build messaging system
6. Create admin dashboard

## Important Security Notes:

⚠️ **NEVER expose the service role key to frontend code**
⚠️ **Always validate user permissions on server-side**
⚠️ **Use RLS policies for database-level security**
⚠️ **Validate all inputs on both client and server side**