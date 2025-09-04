import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Logo from './Images/logo.svg';
import Image from 'next/image';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
                href='#'
                className={`${desktopLinkBaseClass} text-black hover:text-green-600`}
              >
                Contact
              </Link>
              <Link
                href='#'
                className={`${desktopLinkBaseClass} text-black hover:text-green-600`}
              >
                Post a Listing
              </Link>
            </nav>

            {/* Auth Buttons - Desktop */}
            <div className='hidden md:flex items-center gap-3'>
              <button className='bg-white text-black text-base font-normal font-sans px-6 py-2 rounded-md border border-gray-200 hover:border-gray-300 transition-colors'>
                Sign in
              </button>
              <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-2 rounded-md hover:bg-green-700 transition-colors'>
                Register
              </button>
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
                href='#'
                className='text-black text-base font-normal font-sans px-2 py-2'
              >
                Contact
              </Link>
              <Link
                href='#'
                className='text-black text-base font-normal font-sans px-2 py-2'
              >
                Post a Listing
              </Link>
            </nav>
            <div className='flex flex-col gap-3 mt-4'>
              <button className='bg-white text-black text-base font-normal font-sans px-6 py-2 rounded-md border border-gray-200'>
                Sign in
              </button>
              <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-2 rounded-md'>
                Register
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
