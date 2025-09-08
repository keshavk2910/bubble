import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useOptionalUserSession } from '../../lib/useUserSession';
import { useRouter } from 'next/router';
import { 
  Search,
  Bell,
  Download,
  MoreHorizontal,
  Users,
  FileText,
  BarChart3,
  Settings,
  Tag,
  User,
  LogOut,
  Home,
  Edit,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';
import UsersTable from '../../components/UsersTable';

export default function AdminUsers() {
  const router = useRouter();
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Admin user data with session
  const adminUser = {
    name: sessionUser?.display_name || sessionUser?.full_name || 'Admin User',
    avatar: sessionAvatar || '/api/placeholder/40/40',
    initials: sessionUser?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'AD',
    role: 'Super Admin'
  };

  // Mock users data
  const allUsers = [
    {
      id: 1,
      username: 'johnsmith',
      email: 'john.smith@example.com',
      registrationDate: '2023-05-15',
      status: 'Active',
      listings: 8
    },
    {
      id: 2,
      username: 'sarahjohnson',
      email: 'sarah.johnson@example.com',
      registrationDate: '2023-06-22',
      status: 'Active',
      listings: 5
    },
    {
      id: 3,
      username: 'mikewilliams',
      email: 'mike.williams@example.com',
      registrationDate: '2023-07-10',
      status: 'Inactive',
      listings: 0
    },
    {
      id: 4,
      username: 'emilydavis',
      email: 'emily.davis@example.com',
      registrationDate: '2023-08-05',
      status: 'Active',
      listings: 12
    },
    {
      id: 5,
      username: 'robertbrown',
      email: 'robert.brown@example.com',
      registrationDate: '2023-09-18',
      status: 'New',
      listings: 1
    },
    {
      id: 6,
      username: 'lisawilson',
      email: 'lisa.wilson@example.com',
      registrationDate: '2023-10-03',
      status: 'Active',
      listings: 7
    },
    {
      id: 7,
      username: 'davidmiller',
      email: 'david.miller@example.com',
      registrationDate: '2023-10-27',
      status: 'Inactive',
      listings: 3
    },
    {
      id: 8,
      username: 'jennifertaylor',
      email: 'jennifer.taylor@example.com',
      registrationDate: '2023-11-14',
      status: 'New',
      listings: 0
    }
  ];

  useEffect(() => {
    // Load admin verification and users data
    const loadAdminData = async () => {
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

        // Simulate loading users
        setTimeout(() => {
          setUsers(allUsers);
          setIsLoading(false);
        }, 1000);

      } catch (error) {
        console.error('Users page loading error:', error);
        router.push('/sign-in?redirect=/dashboard/users');
      }
    };

    loadAdminData();
  }, [router, allUsers]);

  const filterButtons = [
    { key: 'All', label: 'All', count: allUsers.length },
    { key: 'Active', label: 'Active', count: allUsers.filter(u => u.status === 'Active').length },
    { key: 'Inactive', label: 'Inactive', count: allUsers.filter(u => u.status === 'Inactive').length },
    { key: 'New', label: 'New', count: allUsers.filter(u => u.status === 'New').length }
  ];

  const filteredUsers = statusFilter === 'All' 
    ? allUsers 
    : allUsers.filter(user => user.status === statusFilter);

  const handleEdit = (user) => {
    console.log('Edit user:', user);
  };

  const handleDelete = (user) => {
    console.log('Delete user:', user);
  };

  const handleView = (user) => {
    console.log('View user:', user);
  };

  const handleBan = (user) => {
    console.log('Ban user:', user);
  };

  const handleExport = () => {
    console.log('Exporting users...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 w-60 h-screen bg-green-600 flex flex-col z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-green-500">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm font-bold">B</span>
            </div>
            <h1 className="text-white text-lg font-bold font-sans">
              Bubblebinz
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link
            href="/dashboard/admin"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white"
          >
            <Home className="w-5 h-5" />
            <span className="font-sans">Dashboard</span>
          </Link>

          <Link
            href="/dashboard/listings"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white"
          >
            <FileText className="w-5 h-5" />
            <span className="font-sans">Listings</span>
          </Link>

          <div className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left bg-green-700 text-white">
            <Users className="w-5 h-5" />
            <span className="font-sans">Users</span>
          </div>

          <Link
            href="/dashboard/tags"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white"
          >
            <Tag className="w-5 h-5" />
            <span className="font-sans">Tags</span>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="font-sans">Analytics</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors text-green-100 hover:bg-green-700 hover:text-white"
          >
            <Settings className="w-5 h-5" />
            <span className="font-sans">Settings</span>
          </Link>
        </nav>

        {/* Admin User Info */}
        <div className="px-4 py-6 border-t border-green-500">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center overflow-hidden">
              {sessionAvatar ? (
                <Image
                  src={sessionAvatar}
                  alt="Admin avatar"
                  width={32}
                  height={32}
                  className='w-full h-full object-cover'
                />
              ) : (
                <span className="text-white text-xs font-bold">{adminUser.initials}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{adminUser.name}</p>
              <p className="text-green-200 text-xs truncate">{adminUser.role}</p>
            </div>
          </div>
          
          <button className="flex items-center gap-3 w-full px-4 py-3 text-green-100 hover:bg-green-700 hover:text-white rounded-lg transition-colors text-left">
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-sans">Log out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-60">
        {/* Header */}
        <header className="sticky top-0 bg-white border-b border-gray-200 px-6 py-5 z-30">
          <div className="flex items-center justify-between">
            <h1 className="text-gray-700 text-2xl font-normal font-sans leading-loose">
              Users Center
            </h1>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
                onClick={handleExport}
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
              {/* Users Section */}
              <div className="xl:col-span-3">
                <div className="bg-white rounded-lg border border-gray-200">
                  {/* Users Header with Filters */}
                  <div className="px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-gray-700 text-lg font-normal font-sans leading-7">
                        Users
                      </h2>
                      
                      {/* Search and Filters */}
                      <div className="flex items-center gap-4">
                        {/* Advanced Filters */}
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                            <input
                              type="text"
                              placeholder="Search users..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                          </div>
                          
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Advanced Filters</span>
                          </button>
                        </div>

                        {/* Bulk Actions */}
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors">
                            <Edit className="w-4 h-4" />
                            <span>Edit</span>
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                          <button className="flex items-center gap-2 px-3 py-2 text-gray-600 text-sm hover:bg-gray-50 rounded transition-colors">
                            <User className="w-4 h-4" />
                            <span>Ban</span>
                          </button>
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
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Users Table */}
                  <UsersTable 
                    users={filteredUsers}
                    isLoading={isLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                  />
                </div>
              </div>

              {/* Right Sidebar - Analytics (Same as admin dashboard) */}
              <div className="space-y-6">
                {/* User Insights */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
                    User Insights
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Total Users</span>
                      <span className="text-gray-900 text-2xl font-bold">1,245</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-gray-600 text-sm">Active Today</div>
                        <div className="text-gray-600 text-sm">New This Month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-gray-900 text-lg font-semibold">389</div>
                        <div className="text-gray-900 text-lg font-semibold">42</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* New Registrations Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
                    New Registrations
                  </h3>
                  
                  <div className="h-32 bg-gradient-to-t from-green-100 to-green-50 rounded-lg flex items-end justify-center p-4">
                    <div className="text-center">
                      <div className="w-full h-20 bg-green-200 rounded-t-lg mb-2 relative overflow-hidden">
                        <div className="absolute bottom-0 w-full h-16 bg-green-400 rounded-t-lg"></div>
                      </div>
                      <span className="text-gray-600 text-xs">Chart placeholder</span>
                    </div>
                  </div>
                </div>

                {/* User Activity Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
                    User Activity
                  </h3>
                  
                  <div className="h-24 bg-gray-50 rounded-lg flex items-end justify-between p-2">
                    {[40, 65, 45, 70, 55, 80, 35].map((height, index) => (
                      <div 
                        key={index}
                        className="bg-green-500 rounded-t"
                        style={{ height: `${height}%`, width: '12px' }}
                      ></div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                    <span>Sat</span>
                    <span>Sun</span>
                  </div>
                </div>

                {/* User Types Pie Chart */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
                    User Types
                  </h3>
                  
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="w-24 h-24 rounded-full bg-green-500 relative overflow-hidden">
                      <div className="absolute top-0 left-1/2 w-12 h-12 bg-blue-500 rounded-bl-full"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 bg-purple-500 rounded-tl-full"></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-700 text-xs font-normal font-sans">Service Providers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-gray-700 text-xs font-normal font-sans">Customers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <span className="text-gray-700 text-xs font-normal font-sans">Both</span>
                    </div>
                  </div>
                </div>

                {/* Geographic Distribution */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
                    Geographic Distribution
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { country: 'United States', percentage: 45 },
                      { country: 'Canada', percentage: 25 },
                      { country: 'United Kingdom', percentage: 15 },
                      { country: 'Australia', percentage: 10 },
                      { country: 'Other', percentage: 5 }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700 text-xs font-normal font-sans">{item.country}</span>
                        </div>
                        <span className="text-gray-600 text-xs font-normal font-sans">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}