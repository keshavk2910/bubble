import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  Home,
  FileText,
  Users,
  MessageCircle,
  Shield,
  Tag,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
} from 'lucide-react';
import { useOptionalUserSession } from '../lib/useUserSession';
import LogoLight from './Images/logoLight.png';

export default function AdminSidebar({ currentPage }) {
  const router = useRouter();
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard/admin', icon: Home, key: 'admin' },
    {
      name: 'Listings',
      href: '/dashboard/listings',
      icon: FileText,
      key: 'listings',
    },
    { name: 'Users', href: '/dashboard/users', icon: Users, key: 'users' },
    {
      name: 'Reports',
      href: '/dashboard/reports',
      icon: Shield,
      key: 'reports',
    },
    {
      name: 'Messages',
      href: '/dashboard/admin-messages',
      icon: MessageCircle,
      key: 'admin-messages',
    },
    // { name: 'Tags', href: '/dashboard/tags', icon: Tag, key: 'tags' },
    // { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, key: 'analytics' },
    // { name: 'Settings', href: '/dashboard/settings', icon: Settings, key: 'settings' }
  ];

  const adminUser = {
    name: sessionUser?.display_name || sessionUser?.full_name || 'Admin User',
    avatar: sessionAvatar || '/api/placeholder/40/40',
    initials:
      sessionUser?.full_name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase() || 'AD',
    role: 'Administrator',
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('user_profile');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  return (
    <div className='fixed left-0 top-0 w-60 h-screen bg-green-600 flex flex-col z-40'>
      {/* Logo */}
      <div className='px-6 py-6 border-b border-green-500'>
        {/* Back to Site Button */}
        <Link
          href='/'
          className='flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-green-700 hover:bg-green-800 transition-colors group'
          title='Back to Home'
        >
          <ArrowLeft className='w-4 h-4 text-green-100 group-hover:text-white transition-colors' />
          <span className='text-sm font-medium text-green-100 group-hover:text-white transition-colors'>
            Back to Site
          </span>
        </Link>

        <div className='flex items-center justify-center'>
          <Image src={LogoLight.src} alt='Logo' width={60} height={60} />
        </div>
      </div>

      {/* Navigation */}
      <nav className='flex-1 px-4 py-6 space-y-2'>
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.key;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-colors ${
                isActive
                  ? 'bg-green-700 text-white'
                  : 'text-green-100 hover:bg-green-700 hover:text-white'
              }`}
            >
              <Icon className='w-5 h-5' />
              <span className='font-sans'>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Admin User Info */}
      <div className='px-4 py-6 border-t border-green-500'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='w-8 h-8 bg-green-700 rounded-full flex items-center justify-center overflow-hidden'>
            {sessionAvatar ? (
              <Image
                src={sessionAvatar}
                alt='Admin avatar'
                width={32}
                height={32}
                className='w-full h-full object-cover'
              />
            ) : (
              <span className='text-white text-xs font-bold'>
                {adminUser.initials}
              </span>
            )}
          </div>
          <div className='flex-1 min-w-0'>
            <p className='text-white text-sm font-medium truncate'>
              {adminUser.name}
            </p>
            <p className='text-green-200 text-xs truncate'>{adminUser.role}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className='flex items-center gap-3 w-full px-4 py-3 text-green-100 hover:bg-green-700 hover:text-white rounded-lg transition-colors text-left'
        >
          <LogOut className='w-4 h-4' />
          <span className='text-sm font-sans'>Log out</span>
        </button>
      </div>
    </div>
  );
}
