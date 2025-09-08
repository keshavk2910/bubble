import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useOptionalUserSession } from '../../lib/useUserSession';
import { 
  Filter,
  Ban,
  CheckCircle,
  Shield,
  Users as UsersIcon
} from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import UsersTable from '../../components/UsersTable';

export default function AdminUsers() {
  const router = useRouter();
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [userProfile, setUserProfile] = useState(null);

  // Load real users data from database
  useEffect(() => {
    const loadUsersData = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/users');
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
          router.push('/sign-in?redirect=/dashboard/users');
          return;
        }

        const userData = await userResponse.json();
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);

        // Load users with filters
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (userTypeFilter !== 'all') params.append('user_type', userTypeFilter);
        params.append('limit', '100');

        const usersResponse = await fetch(`/api/admin/users?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData.users);
        }

      } catch (error) {
        console.error('Admin users loading error:', error);
        router.push('/sign-in?redirect=/dashboard/users');
      } finally {
        setIsLoading(false);
      }
    };

    loadUsersData();
  }, [router, searchTerm, statusFilter, userTypeFilter]);

  // Handler functions for user management
  const handleEditUser = (user) => {
    console.log('Edit user:', user);
    // TODO: Implement user editing
  };

  const handleBlockUser = async (user) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const newStatus = user.status === 'blocked' ? 'active' : 'blocked';
      
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setUsers(prev => prev.map(u => 
          u.id === user.id 
            ? { ...u, status: newStatus }
            : u
        ));
      }
    } catch (error) {
      console.error('Block user error:', error);
    }
  };

  const handleViewUser = (user) => {
    console.log('View user:', user);
    // TODO: Implement user detail view
  };

  const handleExport = () => {
    console.log('Exporting users...');
    // TODO: Implement user export
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Users Management - Bin Cleaning Classifieds</title>
        <meta name="description" content="Manage all marketplace users with admin controls" />
      </Head>
      
      <AdminLayout
        currentPage="users"
        title="Users Management"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        showAnalytics={true}
      >
        {/* Users Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 text-lg font-semibold font-sans">
                All Platform Users
              </h2>
              <div className="flex items-center gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                  </select>
                </div>
                
                {/* User Type Filter */}
                <div className="flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={userTypeFilter}
                    onChange={(e) => setUserTypeFilter(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                  >
                    <option value="all">All Types</option>
                    <option value="customer">Customers</option>
                    <option value="service_provider">Service Providers</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">
                Total: {users.length} users
                {statusFilter !== 'all' && ` • Status: ${statusFilter}`}
                {userTypeFilter !== 'all' && ` • Type: ${userTypeFilter}`}
              </p>
            </div>
          </div>
          
          <UsersTable 
            users={users}
            isLoading={false}
            onEdit={handleEditUser}
            onBlock={handleBlockUser}
            onView={handleViewUser}
          />
        </div>
      </AdminLayout>
    </>
  );
}