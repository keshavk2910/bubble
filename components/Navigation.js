import { useState } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className='w-full border-b border-stone-200'>
      <div className='max-w-7xl mx-auto px-6 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <Link href='/' className='flex items-center gap-3'>
            <div className='w-9 h-8 bg-gradient-to-br from-green-600 to-green-600 rounded-full relative'>
              <div className='absolute top-1 left-1 w-5 h-0.5 bg-white'></div>
            </div>
            <h1 className='text-gray-900 text-2xl font-bold font-sans leading-snug'>
              Bin Cleaning Classifieds
            </h1>
          </Link>

          {/* Navigation - Desktop */}
          <nav className='hidden md:flex items-center gap-8'>
            <Link
              href='/browse-listings'
              className='text-green-600 text-base font-normal font-sans px-2 py-2 rounded-lg'
            >
              Browse Listings
            </Link>
            <Link
              href='/our-mission'
              className='text-black text-base font-normal font-sans px-2 py-2 rounded-lg hover:text-green-600 transition-colors'
            >
              Our Mission
            </Link>
            <Link
              href='/faq'
              className='text-black text-base font-normal font-sans px-2 py-2 rounded-lg hover:text-green-600 transition-colors'
            >
              FAQ
            </Link>
            <Link
              href='#'
              className='text-black text-base font-normal font-sans px-2 py-2 rounded-lg hover:text-green-600 transition-colors'
            >
              Contact
            </Link>
            <Link
              href='#'
              className='text-black text-base font-normal font-sans px-2 py-2 rounded-lg hover:text-green-600 transition-colors'
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
                className='text-green-600 text-base font-normal font-sans px-2 py-2'
              >
                Browse Listings
              </Link>
              <Link
                href='#'
                className='text-black text-base font-normal font-sans px-2 py-2'
              >
                Our Mission
              </Link>
              <Link
                href='/faq'
                className='text-black text-base font-normal font-sans px-2 py-2'
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
