import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { Flag, User, Shield } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import ReportsTable from '../../components/ReportsTable';

export default function AdminReports() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [userProfile, setUserProfile] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Load reports data
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/reports');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Verify admin role
        const userResponse = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          router.push('/sign-in?redirect=/dashboard/reports');
          return;
        }

        const userData = await userResponse.json();
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);

        // Load reports
        const params = new URLSearchParams();
        params.append('limit', '100');
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'All') params.append('status', statusFilter);

        const reportsResponse = await fetch(`/api/admin/reports?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (reportsResponse.ok) {
          const reportsData = await reportsResponse.json();
          setReports(reportsData.reports);
        }

      } catch (error) {
        console.error('Admin reports loading error:', error);
        router.push('/sign-in?redirect=/dashboard/reports');
      } finally {
        setIsLoading(false);
      }
    };

    loadReportsData();
  }, [router, searchTerm, statusFilter]);

  const filterButtons = [
    { key: 'All', label: 'All', count: reports.length },
    { key: 'pending', label: 'Pending', count: reports.filter(r => r.status === 'pending').length },
    { key: 'reviewed', label: 'Reviewed', count: reports.filter(r => r.status === 'reviewed').length },
    { key: 'resolved', label: 'Resolved', count: reports.filter(r => r.status === 'resolved').length },
    { key: 'dismissed', label: 'Dismissed', count: reports.filter(r => r.status === 'dismissed').length }
  ];

  const filteredReports = statusFilter === 'All' 
    ? reports 
    : reports.filter(report => report.status === statusFilter);

  const handleViewListing = (listing) => {
    window.open(`/listing/${listing.slug || listing.id}`, '_blank');
  };

  const handleViewReporter = (report) => {
    setSelectedUser({
      id: report.reporter_user_id,
      email: report.reporter_email,
      full_name: report.reporter?.full_name || 'Anonymous',
      display_name: report.reporter?.display_name,
      user_type: report.reporter?.user_type,
      status: report.reporter?.status,
      registration_date: report.reporter?.registration_date,
      phone: report.reporter?.phone,
      verified: report.reporter?.email_verified && report.reporter?.phone_verified
    });
    setShowUserModal(true);
  };

  const handleResolveReport = async (report) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/admin/reports/${report.id}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setReports(prev => prev.map(r => 
          r.id === report.id 
            ? { ...r, status: 'resolved', resolved_at: new Date().toISOString() }
            : r
        ));
      }
    } catch (error) {
      console.error('Resolve report error:', error);
    }
  };

  const handleDismissReport = async (report) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/admin/reports/${report.id}/dismiss`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Update local state
        setReports(prev => prev.map(r => 
          r.id === report.id 
            ? { ...r, status: 'dismissed' }
            : r
        ));
      }
    } catch (error) {
      console.error('Dismiss report error:', error);
    }
  };

  const handleChangeListingStatus = async (listing, newStatus) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/admin/listings/${listing.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update listing status in reports
        setReports(prev => prev.map(r => 
          r.listing?.id === listing.id 
            ? { ...r, listing: { ...r.listing, status: newStatus } }
            : r
        ));
      }
    } catch (error) {
      console.error('Change listing status error:', error);
    }
  };

  const handleExport = () => {
    console.log('Exporting reports...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reports Management - Bins Buy Sell</title>
        <meta name="description" content="Manage listing reports and moderate marketplace content." />
      </Head>
      
      <AdminLayout
        currentPage="reports"
        title="Reports Center"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        showAnalytics={true}
      >
        {/* Reports Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-gray-700 text-lg font-normal font-sans leading-7">
                  Content Reports
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Shield className="w-4 h-4" />
                  <span>{reports.filter(r => r.status === 'pending').length} pending review</span>
                </div>
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-2 mb-6">
              <span className="text-gray-500 text-sm font-normal font-sans leading-tight mr-2">
                Filter by:
              </span>
              {filterButtons.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setStatusFilter(filter.key)}
                  className={`px-3 py-1 rounded text-sm font-normal font-sans leading-tight transition-colors ${
                    statusFilter === filter.key
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          </div>

          {/* Reports Table */}
          <ReportsTable
            reports={filteredReports}
            isLoading={false}
            onViewListing={handleViewListing}
            onViewReporter={handleViewReporter}
            onResolve={handleResolveReport}
            onDismiss={handleDismissReport}
            onChangeListingStatus={handleChangeListingStatus}
          />
        </div>

        {/* User Info Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-gray-900 text-xl font-semibold font-sans">
                      Reporter Information
                    </h2>
                    <p className="text-gray-500 text-sm font-normal font-sans">
                      User details and account status
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Full Name</label>
                    <p className="text-gray-900 text-base">{selectedUser.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Email</label>
                    <p className="text-gray-900 text-base">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">User Type</label>
                    <p className="text-gray-900 text-base capitalize">{selectedUser.user_type || 'customer'}</p>
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">Account Status</label>
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      selectedUser.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedUser.status || 'active'}
                    </span>
                  </div>
                </div>

                {selectedUser.id && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => window.open(`/dashboard/users?user=${selectedUser.id}`, '_blank')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Full Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </>
  );
}