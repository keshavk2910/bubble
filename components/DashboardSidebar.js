import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  LayoutDashboard,
  FileText,
  User,
  MessageCircle,
  HelpCircle,
  LogOut,
  Plus,
  ArrowLeft,
} from 'lucide-react';
import logoTest from './Images/logoTest.png';
import Image from 'next/image';

export default function DashboardSidebar() {
  const router = useRouter();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard/user',
      icon: LayoutDashboard,
      current: true,
    },
    {
      name: 'Listings',
      href: '/dashboard/user?highlight=listings',
      icon: FileText,
      current: false,
    },
    {
      name: 'Post Listing',
      href: '/dashboard/post-new-listing',
      icon: Plus,
      current: false,
    },
    { name: 'Profile', href: '/dashboard/profile', icon: User, current: false },
    {
      name: 'Messages',
      href: '/dashboard/messages',
      icon: MessageCircle,
      current: false,
    },
    {
      name: 'Help Center',
      href: '/faq',
      icon: HelpCircle,
      current: false,
    },
  ];

  const isActive = (href) => {
    return router.pathname === href;
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      localStorage.removeItem('supabase_session');
      localStorage.removeItem('user_profile');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className='fixed left-0 top-0 w-60 h-screen bg-white border-r border-gray-200 flex flex-col z-40'>
      {/* Dashboard Header */}
      <div className='px-6 py-6 border-b border-gray-200'>
        {/* Back to Site Button */}
        <Link
          href='/'
          className='flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors group'
          title='Back to Home'
        >
          <ArrowLeft className='w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors' />
          <span className='text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors'>
            Back to Site
          </span>
        </Link>

        <Link href='/'>
          <div className='flex items-center gap-3 '>
            <Image
              src={logoTest.src}
              alt='Logo'
              width={32}
              height={32}
              className=''
            />

            <h1 className='text-gray-700 text-lg font-normal font-sans leading-7'>
              Dashboard
            </h1>
          </div>
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav className='flex-1 px-4 py-6 space-y-1'>
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-4 px-4 py-3 rounded-lg transition-colors ${
                active
                  ? 'bg-green-50 text-green-600'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              {/* Active indicator */}
              {active && (
                <div className='absolute left-0 top-0 bottom-0 w-1 bg-green-600 rounded-r'></div>
              )}

              <Icon
                className={`w-5 h-5 ${
                  active ? 'text-green-600' : 'text-gray-500'
                }`}
              />
              <span
                className={`text-base font-normal font-sans leading-normal ${
                  active ? 'text-green-600' : 'text-gray-500'
                }`}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className='px-4 py-6 border-t border-gray-200'>
        <button
          onClick={handleLogout}
          className='flex items-center gap-4 px-4 py-3 text-gray-500 hover:bg-gray-50 hover:text-gray-700 rounded-lg transition-colors w-full text-left'
        >
          <LogOut className='w-5 h-5' />
          <span className='text-base font-normal font-sans leading-normal'>
            Log out
          </span>
        </button>
      </div>
    </div>
  );
}
