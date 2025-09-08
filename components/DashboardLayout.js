import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Bell, MoreHorizontal, LogOut, User, Settings } from 'lucide-react';
import DashboardSidebar from './DashboardSidebar';
import Link from 'next/link';
import { useOptionalUserSession } from '../lib/useUserSession';

export default function DashboardLayout({
  children,
  title = 'Dashboard',
  subtitle = "Welcome back! Here's an overview of your activity",
  showHeader = true,
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const dropdownRef = useRef(null);
  const { user, avatar, isAuthenticated } = useOptionalUserSession();

  // User data with fallback for header
  const userData = {
    name: user?.display_name || user?.full_name || 'User',
    email: user?.email || 'user@example.com',
    avatar: avatar || '/api/placeholder/40/40',
  };
  console.log(user);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('user_profile');
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <div className='ml-60 overflow-hidden'>
        {/* Header */}
        {showHeader && (
          <header className='sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-30'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-gray-900 text-2xl font-semibold font-sans'>
                  {title}
                </h1>
                <p className='text-gray-500 text-base font-normal font-sans'>
                  {subtitle}
                </p>
              </div>

              <div className='flex items-center gap-4'>
                {/* Notifications */}
                <button className='relative p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                  <Bell className='w-6 h-6' />
                  <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                </button>

                {/* User Menu */}
                <div
                  className='flex items-center gap-3 relative'
                  ref={dropdownRef}
                >
                  <div className='w-10 h-10 bg-gray-100 rounded-full overflow-hidden'>
                    {userData.avatar !== '/api/placeholder/40/40' ? (
                      <Image
                        src={userData.avatar}
                        alt='User avatar'
                        width={40}
                        height={40}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <User className='w-6 h-6 text-gray-600' />
                    )}
                  </div>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className='text-gray-700 hover:text-gray-900 transition-colors'
                  >
                    <MoreHorizontal className='w-4 h-4' />
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className='absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50'>
                      <div className='px-4 py-2 border-b border-gray-200'>
                        <p className='text-sm font-medium text-gray-900'>
                          {userData.name}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {userData.email}
                        </p>
                      </div>
                      <Link
                        href='/dashboard/profile'
                        className='flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors'
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className='w-4 h-4' />
                        Profile Settings
                      </Link>

                      <div className='border-t border-gray-200 mt-2 pt-2'>
                        <button
                          onClick={handleLogout}
                          className='flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left'
                        >
                          <LogOut className='w-4 h-4' />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
        )}

        {/* Main Content Area */}
        <main className='p-6'>{children}</main>
      </div>
    </div>
  );
}
