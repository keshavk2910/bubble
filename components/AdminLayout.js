import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Search, Bell, Download, ArrowLeft } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import UserInsights from './admin/UserInsights';
import NewRegistrations from './admin/NewRegistrations';
import UserActivity from './admin/UserActivity';
import UserTypes from './admin/UserTypes';
import GeographicDistribution from './admin/GeographicDistribution';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

export default function AdminLayout({
  children,
  currentPage,
  title = 'Admin Control Center',
  searchTerm = '',
  onSearchChange,
  onExport,
  showAnalytics = true
}) {
  const [analytics, setAnalytics] = useState({});
  const [adminStats, setAdminStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Load analytics data independently
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) return;

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Load analytics and stats in parallel
        const [analyticsResponse, statsResponse] = await Promise.all([
          fetch('/api/admin/analytics', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          }),
          fetch('/api/stats', {
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
          })
        ]);

        if (analyticsResponse.ok) {
          const analyticsData = await analyticsResponse.json();
          setAnalytics(analyticsData.analytics);
        }

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setAdminStats(statsData.stats);
        }

      } catch (error) {
        console.error('Analytics loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <AdminSidebar currentPage={currentPage} />

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-700 text-2xl font-normal font-sans leading-loose">
              {title}
            </h1>

            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 bg-white rounded-md border border-gray-300 text-gray-400 text-base font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>

              {/* Notifications */}
              <NotificationBell />

              {/* Export Button */}
              {onExport && (
                <button
                  onClick={onExport}
                  className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-base font-normal font-sans">Export</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Main Content Section */}
              <div className="xl:col-span-3">
                {children}
              </div>

              {/* Analytics Sidebar */}
              {showAnalytics && (
                <div className="space-y-6">
                  <UserInsights 
                    stats={analytics.userInsights} 
                    isLoading={isLoading} 
                  />
                  <NewRegistrations 
                    data={analytics} 
                    isLoading={isLoading} 
                  />
                  <UserActivity 
                    data={analytics.userActivity} 
                    isLoading={isLoading} 
                  />
                  <UserTypes 
                    data={analytics.userTypeDistribution} 
                    isLoading={isLoading} 
                  />
                  <GeographicDistribution 
                    data={analytics} 
                    isLoading={isLoading} 
                  />
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}