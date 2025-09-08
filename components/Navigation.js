import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Images/logo.svg';
import Image from 'next/image';
import NotificationBell from './NotificationBell';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  // Centralized className for all desktop nav links
  const desktopLinkBaseClass =
    'text-base font-normal font-sans px-2 py-2 rounded-lg transition-colors cursor-pointer';

  // Helper to determine if a link is active
  const isActive = (href) => {
    // For anchor links or "#" just return false (never active)
    if (href === '#') return false;
    // For root path, match exactly
    if (href === '/') return router.pathname === '/';
    // For other paths, match if router.pathname starts with href
    return router.pathname.startsWith(href);
  };

  // On mount, check for session and user role
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const sessionStr = localStorage.getItem('supabase_session');
      setSession(sessionStr);

      // Try to get user role from session (if stored)
      // If not, fallback to 'user'
      let role = null;
      try {
        if (sessionStr) {
          const sessionObj = JSON.parse(sessionStr);
          // Try to get role from session.user.user_metadata.role or session.user.role
          if (sessionObj?.user?.user_metadata?.role) {
            role = sessionObj.user.user_metadata.role;
          } else if (sessionObj?.user?.role) {
            role = sessionObj.user.role;
          }
        }
      } catch (e) {
        // ignore parse errors
      }
      setUserRole(role || 'user');
    }
  }, []);

  // Dashboard link based on userRole
  const dashboardHref =
    userRole === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  return (
    <header className='w-full border-b border-stone-200'>
      <div className='max-w-7xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3'>
            <div className=''>
              <Image src={Logo.src} alt='Logo' width={280} height={180} />
            </div>
          </Link>
          <div className='flex gap-4'>
            {/* Navigation - Desktop */}
            <nav className='hidden md:flex items-center gap-8'>
              <Link
                href='/browse-listings'
                className={`${desktopLinkBaseClass} ${
                  isActive('/browse-listings')
                    ? 'text-green-600'
                    : 'text-black hover:text-green-600'
                }`}
              >
                Browse Listings
              </Link>
              <Link
                href='/our-mission'
                className={`${desktopLinkBaseClass} ${
                  isActive('/our-mission')
                    ? 'text-green-600'
                    : 'text-black hover:text-green-600'
                }`}
              >
                Our Mission
              </Link>
              <Link
                href='/faq'
                className={`${desktopLinkBaseClass} ${
                  isActive('/faq')
                    ? 'text-green-600'
                    : 'text-black hover:text-green-600'
                }`}
              >
                FAQ
              </Link>
              <Link
                href='/contact'
                className={`${desktopLinkBaseClass} ${
                  isActive('/contact')
                    ? 'text-green-600'
                    : 'text-black hover:text-green-600'
                }`}
              >
                Contact
              </Link>
              <Link
                href='/dashboard/post-new-listing'
                className={`${desktopLinkBaseClass} ${
                  isActive('/dashboard/post-new-listing')
                    ? 'text-green-600'
                    : 'text-black hover:text-green-600'
                }`}
              >
                Post a Listing
              </Link>
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className='hidden md:flex items-center gap-3'>
              {!session ? (
                <>
                  <Link href='/sign-in'>
                    <button className='bg-white text-black text-base font-normal font-sans px-6 py-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors'>
                      Sign in
                    </button>
                  </Link>
                  <Link href='/register'>
                    <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-2 rounded-md hover:bg-green-700 transition-colors'>
                      Register
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <NotificationBell />
                  <Link href={dashboardHref}>
                    <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-2 rounded-md hover:bg-green-700 transition-colors'>
                      Dashboard
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Mobile Menu Button */}
          <button
            className='md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-gray-200'
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              ) : (
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M4 6h16M4 12h16M4 18h16'
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden mt-4 pb-4 border-t border-gray-200 pt-4'>
            <nav className='flex flex-col gap-4'>
              <Link
                href='/browse-listings'
                className={`text-base font-normal font-sans px-2 py-2 ${
                  isActive('/browse-listings') ? 'text-green-600' : 'text-black'
                }`}
              >
                Browse Listings
              </Link>
              <Link
                href='/our-mission'
                className={`text-base font-normal font-sans px-2 py-2 ${
                  isActive('/our-mission') ? 'text-green-600' : 'text-black'
                }`}
              >
                Our Mission
              </Link>
              <Link
                href='/faq'
                className={`text-base font-normal font-sans px-2 py-2 ${
                  isActive('/faq') ? 'text-green-600' : 'text-black'
                }`}
              >
                FAQ
              </Link>
              <Link
                href='/contact'
                className={`text-base font-normal font-sans px-2 py-2 ${
                  isActive('/contact') ? 'text-green-600' : 'text-black'
                }`}
              >
                Contact
              </Link>
              <Link
                href='/dashboard/post-new-listing'
                className={`text-base font-normal font-sans px-2 py-2 ${
                  isActive('/dashboard/post-new-listing')
                    ? 'text-green-600'
                    : 'text-black'
                }`}
              >
                Post a Listing
              </Link>
            </nav>
            <div className='flex flex-col gap-3 mt-4'>
              {!session ? (
                <>
                  <Link href='/sign-in'>
                    <button className='bg-white text-black text-base font-normal font-sans px-6 py-2 rounded-md border border-gray-200 w-full'>
                      Sign in
                    </button>
                  </Link>
                  <Link href='/register'>
                    <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-2 rounded-md'>
                      Register
                    </button>
                  </Link>
                </>
              ) : (
                <Link href={dashboardHref}>
                  <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-2 rounded-md w-full'>
                    Dashboard
                  </button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
