import Head from 'next/head';
import { Search, Bell, Download } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import UserInsights from './admin/UserInsights';
import NewRegistrations from './admin/NewRegistrations';
import UserActivity from './admin/UserActivity';
import UserTypes from './admin/UserTypes';
import GeographicDistribution from './admin/GeographicDistribution';

export default function AdminLayout({
  children,
  currentPage,
  title = 'Admin Control Center',
  searchTerm = '',
  onSearchChange,
  onExport,
  showAnalytics = true,
  analytics = {},
  isLoading = false
}) {

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
              <div className="relative">
                <button className="p-2 text-gray-600 hover:text-gray-800">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={onExport}
                className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-base font-normal font-sans">Export</span>
              </button>
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