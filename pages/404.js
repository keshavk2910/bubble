import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import Head from 'next/head';
export default function Custom404() {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(
        `/browse-listings?search=${encodeURIComponent(searchTerm.trim())}`
      );
    }
  };

  return (
    <Layout>
      <Head>
        <title>404 - Bin Cleaning Classifieds</title>
        <meta name='description' content='Page not found' />
      </Head>
      <div className='min-h-screen bg-white'>
        <div className='max-w-4xl mx-auto px-6 py-16'>
          {/* Hero Section with Icon */}
          <div className='text-center mb-16'>
            {/* Trash Can with Question Mark Icon */}
            <div className='w-64 h-64 mx-auto mb-8 relative'>
              {/* Trash Can Icon */}
              <div className='w-32 h-32 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                <svg
                  className='w-32 h-32 text-gray-700'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    fillRule='evenodd'
                    d='M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.393 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.607-1.428 1.364-1.452zM6.75 7.5l1 12.5h8.5l1-12.5h-10.5z'
                    clipRule='evenodd'
                  />
                  <path d='M9.75 9.75a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75zm4.5 0a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0v-6a.75.75 0 01.75-.75z' />
                </svg>
              </div>

              {/* Question Mark Circle */}
              <div className='w-16 h-16 absolute top-12 right-10 bg-white rounded-full border-2 border-gray-900 flex items-center justify-center'>
                <span className='text-gray-700 text-3xl font-normal font-sans'>
                  ?
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className='text-gray-700 text-4xl font-normal font-sans leading-10 mb-6'>
              404 - We&apos;ve Cleaned Up This Page
            </h1>

            {/* Subheading */}
            <p className='text-gray-700 text-xl font-normal font-sans leading-7 mb-12 max-w-2xl mx-auto'>
              Sorry, the page you&apos;re looking for has been moved or no
              longer exists
            </p>
          </div>

          {/* Action Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-16'>
            {/* Back to Homepage Card */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-4 mb-4'>
                <svg
                  className='w-6 h-5 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z'
                    clipRule='evenodd'
                  />
                </svg>
                <h3 className='text-gray-700 text-xl font-normal font-sans leading-7'>
                  Back to Homepage
                </h3>
              </div>

              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-6'>
                Return to our main page to explore all our services and
                features.
              </p>

              <Link
                href='/'
                className='block w-full bg-neutral-900 hover:bg-neutral-800 text-white text-base font-normal font-sans py-3 px-6 rounded-xl text-center transition-colors'
              >
                Go to Homepage
              </Link>
            </div>

            {/* Browse Listings Card */}
            <div className='bg-white rounded-xl border border-gray-200 p-6'>
              <div className='flex items-center gap-4 mb-4'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
                </svg>
                <h3 className='text-gray-700 text-xl font-normal font-sans leading-7'>
                  Browse Listings
                </h3>
              </div>

              <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-6'>
                Explore available franchises, equipment, and business
                opportunities.
              </p>

              <Link
                href='/browse-listings'
                className='block w-full bg-green-600 hover:bg-green-700 text-white text-base font-normal font-sans py-3 px-6 rounded-xl text-center transition-colors'
              >
                View Listings
              </Link>
            </div>
          </div>

          {/* Search Section */}
          <div className='text-center'>
            <p className='text-gray-700 text-base font-normal font-sans leading-normal mb-6'>
              Or try searching for what you need:
            </p>

            <form onSubmit={handleSearch} className='max-w-lg mx-auto'>
              <div className='flex rounded-xl border border-gray-200 overflow-hidden'>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder='Search for listings, resources, etc.'
                  className='flex-1 px-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent'
                />
                <button
                  type='submit'
                  className='bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2'
                >
                  <svg
                    className='w-4 h-4'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
