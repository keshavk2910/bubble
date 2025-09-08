import { supabaseAdmin } from '../../../lib/supabase';
import { requireAdmin } from '../../../lib/auth-middleware';

// Get comprehensive admin analytics
async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get monthly registrations for the last 12 months
    const getMonthlyRegistrations = async () => {
      const { data, error } = await supabaseAdmin
        .from('user_profiles')
        .select('registration_date')
        .gte('registration_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      // Group by month
      const monthlyData = {};
      const months = [];
      
      // Generate last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
        const monthName = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months.push({ key: monthKey, name: monthName });
        monthlyData[monthKey] = 0;
      }

      // Count registrations by month
      data.forEach(user => {
        const monthKey = user.registration_date.slice(0, 7);
        if (monthlyData.hasOwnProperty(monthKey)) {
          monthlyData[monthKey]++;
        }
      });

      return months.map(month => ({
        month: month.name,
        registrations: monthlyData[month.key]
      }));
    };

    // Get user activity metrics
    const getUserActivity = async () => {
      // Get unique users who posted listings this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: listingUsers, error: listingError } = await supabaseAdmin
        .from('listings')
        .select('user_id')
        .gte('created_at', startOfMonth.toISOString())
        .is('deleted_at', null);

      // Get unique users who sent messages this month
      const { data: messageUsers, error: messageError } = await supabaseAdmin
        .from('messages')
        .select('sender_id')
        .gte('created_at', startOfMonth.toISOString());

      const uniqueListingUsers = new Set(listingUsers?.map(l => l.user_id) || []);
      const uniqueMessageUsers = new Set(messageUsers?.map(m => m.sender_id) || []);

      return {
        newListingsPosted: listingUsers?.length || 0,
        uniqueListingUsers: uniqueListingUsers.size,
        totalMessages: messageUsers?.length || 0,
        uniqueMessageUsers: uniqueMessageUsers.size
      };
    };

    // Get user type distribution
    const getUserTypeDistribution = async () => {
      const [customersResult, serviceProvidersResult] = await Promise.all([
        supabaseAdmin
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'customer'),
        supabaseAdmin
          .from('user_profiles')
          .select('*', { count: 'exact', head: true })
          .eq('user_type', 'service_provider')
      ]);

      return {
        customer: customersResult.count || 0,
        service_provider: serviceProvidersResult.count || 0
      };
    };

    // Get geographic distribution by country
    const getGeographicDistribution = async () => {
      // Get all users and count by country
      const { data: users, error } = await supabaseAdmin
        .from('user_profiles')
        .select('country');

      if (error) throw error;

      // Count users by country
      const countryCount = {};
      users.forEach(user => {
        if (user.country) {
          countryCount[user.country] = (countryCount[user.country] || 0) + 1;
        }
      });

      // Convert to array and sort by count
      return Object.entries(countryCount)
        .map(([country, users]) => ({ country, users }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 10); // Top 10 countries
    };

    // Get basic user insights
    const getUserInsights = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thisMonth = new Date();
      thisMonth.setDate(1);
      thisMonth.setHours(0, 0, 0, 0);

      const [
        totalUsersResult,
        activeUsersResult,
        newUsersThisMonthResult,
        serviceProvidersResult,
        blockedUsersResult
      ] = await Promise.all([
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).gte('registration_date', thisMonth.toISOString()),
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('user_type', 'service_provider'),
        supabaseAdmin.from('user_profiles').select('*', { count: 'exact', head: true }).eq('status', 'blocked')
      ]);

      return {
        totalUsers: totalUsersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        newUsersThisMonth: newUsersThisMonthResult.count || 0,
        serviceProviders: serviceProvidersResult.count || 0,
        customers: (totalUsersResult.count || 0) - (serviceProvidersResult.count || 0),
        blockedUsers: blockedUsersResult.count || 0
      };
    };

    // Execute all analytics queries in parallel
    const [
      monthlyRegistrations,
      userActivity,
      userTypeDistribution,
      geographicDistribution,
      userInsights
    ] = await Promise.all([
      getMonthlyRegistrations(),
      getUserActivity(),
      getUserTypeDistribution(),
      getGeographicDistribution(),
      getUserInsights()
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        userInsights,
        monthlyRegistrations,
        userActivity,
        userTypeDistribution,
        geographicDistribution
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: 'Could not fetch analytics data'
    });
  }
}

export default requireAdmin(handler);