import Head from 'next/head';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ListingCard from '../components/ListingCard';
import {
  Image1,
  Image2,
  Image3,
  Image4,
  Icon1,
  Icon2,
  Icon3,
  Icon4,
  HowIcon1,
  HowIcon2,
  HowIcon3,
  BlackQuote,
} from '../components/Images/Homepage';
import Layout from '@/components/Layout';
export default function Home() {
  const [featuredListings, setFeaturedListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('latest');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load featured listings
  useEffect(() => {
    const loadFeaturedListings = async () => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams();
        params.append('limit', '6'); // Show 6 listings

        // Apply filter based on active filter
        switch (activeFilter) {
          case 'latest':
            params.append('sort', 'newest');
            break;
          case 'most-viewed':
            params.append('sort', 'newest'); // Fallback to newest for now
            break;
          case 'price-high':
            params.append('sort', 'price-high');
            break;
        }

        const response = await fetch(`/api/public/listings?${params}`);

        if (response.ok) {
          const data = await response.json();
          setFeaturedListings(data.listings);
        } else {
          console.error('Failed to load featured listings');
          setFeaturedListings([]);
        }
      } catch (error) {
        console.error('Load featured listings error:', error);
        setFeaturedListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFeaturedListings();
  }, [activeFilter]);

  const handleSearch = (e) => {
    e.preventDefault();

    // Build search URL with parameters
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.append('search', searchTerm.trim());
    if (selectedCategory !== 'all') params.append('category', selectedCategory);

    // Redirect to browse-listings with search parameters
    window.location.href = `/browse-listings?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>
          Bins Buy Sell - Buy & Sell Pressure Washing Equipment
        </title>
        <meta
          name='description'
          content='The premier marketplace for pressure washing and bin cleaning businesses. Buy and sell trucks, equipment, and complete businesses.'
        />
        <meta
          name='keywords'
          content='pressure washing, bin cleaning, equipment, trucks, business, marketplace'
        />
      </Head>
      <Layout>
        <div className='w-full bg-white overflow-hidden'>
          {/* Hero Section */}
          <section className='max-w-7xl mx-auto px-6 py-16'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
              {/* Left Content */}
              <div className='space-y-8'>
                <h1 className='text-gray-900 text-6xl font-bold font-sans leading-[59px]'>
                  Buy or Sell Trucks, Gear, or Your Whole Cleaning Biz
                </h1>
                <p className='text-gray-600 text-lg font-normal font-sans leading-7'>
                  A search-first marketplace for pressure washing and bin
                  cleaning businesses. Trucks, parts, or entire companies — all
                  in one place.
                </p>
                <Link
                  href='/register'
                  className='bg-green-600 text-white text-base font-normal font-sans px-8 py-3 rounded-md'
                >
                  Get Started
                </Link>
              </div>

              {/* Right Images */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-4'>
                  <Image
                    src={Image1.src}
                    alt='Featured truck'
                    width={291}
                    height={192}
                    className='w-full rounded-lg'
                  />
                  <Image
                    src={Image2.src}
                    alt='Featured truck'
                    width={291}
                    height={192}
                    className='w-full rounded-lg'
                  />
                </div>
                <div className='space-y-4'>
                  <Image
                    src={Image3.src}
                    alt='Equipment'
                    width={291}
                    height={192}
                    className='w-full rounded-lg'
                  />

                  <Image
                    src={Image4.src}
                    alt='Professional cleaning'
                    width={291}
                    height={192}
                    className='w-full rounded-lg'
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Search Section */}
          <section className='max-w-7xl mx-auto px-6 mb-16'>
            <div className='bg-white rounded-lg shadow-lg p-6'>
              <form onSubmit={handleSearch}>
                <div className='flex flex-col md:flex-row gap-4'>
                  <div className='flex-1 relative'>
                    <div className='absolute left-4 top-3'>
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
                    </div>
                    <input
                      type='text'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder='Search by keyword or ZIP code (e.g. pressure washer, truck)'
                      className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-md text-gray-700 text-base font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-600'
                    />
                  </div>
                  <div className='flex gap-4'>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className='bg-white border border-gray-200 rounded-md px-4 py-3 text-black text-base font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-600'
                    >
                      <option value='all'>All Categories</option>
                      <option value='equipment'>Equipment</option>
                      <option value='business'>Business</option>
                      <option value='truck'>Truck</option>
                      <option value='parts'>Parts</option>
                    </select>
                    <button
                      type='submit'
                      className='bg-green-600 text-white text-base font-normal font-sans px-6 py-3 rounded-md hover:bg-green-700 transition-colors'
                    >
                      Search
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </section>

          {/* Browse Categories */}
          <section className='max-w-7xl mx-auto  py-16'>
            <div className='text-center mb-12'>
              <h2 className='text-gray-900 text-3xl font-medium font-sans leading-9'>
                Browse Categories
              </h2>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              {/* Trucks & Vehicles */}
              <div className='border border-gray-200 rounded-lg p-6 flex items-center gap-4'>
                <div className=''>
                  <Image
                    src={Icon1.src}
                    alt='Trucks & Vehicles'
                    width={100}
                    height={100}
                  />
                </div>
                <div className=''>
                  <h3 className='text-black text-xl font-normal font-sans leading-7'>
                    Trucks & Vehicles
                  </h3>
                  <p className='text-gray-600 text-sm font-normal font-sans mt-1'>
                    Find specialized vehicles for your business
                  </p>
                </div>
              </div>

              {/* Equipment & Tools */}
              <div className='border border-gray-200 rounded-lg p-6 flex items-center gap-4'>
                <div className=''>
                  <Image
                    src={Icon2.src}
                    alt='Equipment & Tools'
                    width={100}
                    height={100}
                  />
                </div>
                <div className=''>
                  <h3 className='text-black text-xl font-normal font-sans leading-7'>
                    Equipment & Tools
                  </h3>
                  <p className='text-gray-600 text-sm font-normal font-sans mt-1'>
                    Professional-grade cleaning equipment
                  </p>
                </div>
              </div>

              {/* Complete Businesses */}
              <div className='border border-gray-200 rounded-lg p-6 flex items-center gap-4 '>
                <div className=''>
                  <Image
                    src={Icon3.src}
                    alt='Complete Businesses'
                    width={100}
                    height={100}
                  />
                </div>
                <div className=''>
                  <h3 className='text-black text-xl font-normal font-sans leading-7'>
                    Complete Businesses
                  </h3>
                  <p className='text-gray-600 text-sm font-normal font-sans mt-1'>
                    Turnkey operations ready to go
                  </p>
                </div>
              </div>

              {/* Parts & Accessories */}
              <div className='border border-gray-200 rounded-lg p-6 flex items-center gap-4'>
                <div className=''>
                  <Image
                    src={Icon4.src}
                    alt='Parts & Accessories'
                    width={100}
                    height={100}
                  />
                </div>
                <div className=''>
                  <h3 className='text-black text-xl font-normal font-sans leading-7'>
                    Parts & Accessories
                  </h3>
                  <p className='text-gray-600 text-sm font-normal font-sans mt-1'>
                    Replacement parts and upgrades
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className='bg-gray-900 py-16'>
            <div className='max-w-7xl mx-auto px-6'>
              <div className='text-center mb-16'>
                <h2 className='text-white text-4xl font-medium font-sans leading-9'>
                  How It Works
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-12'>
                {/* Step 1 */}
                <div className='text-center'>
                  <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6'>
                    <Image
                      src={HowIcon1.src}
                      alt='How It Works'
                      width={100}
                      height={100}
                    />
                  </div>
                  <h3 className='text-white text-lg font-normal font-sans leading-7 mb-4'>
                    Browse Listings
                  </h3>
                  <p className='text-white text-sm font-normal font-sans leading-normal'>
                    Search through our marketplace for equipment, trucks, or
                    entire businesses that match your needs.
                  </p>
                </div>

                {/* Step 2 */}
                <div className='text-center'>
                  <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6'>
                    <Image
                      src={HowIcon2.src}
                      alt='How It Works'
                      width={100}
                      height={100}
                    />
                  </div>
                  <h3 className='text-white text-lg font-medium font-sans leading-7 mb-4'>
                    Create Free Account
                  </h3>
                  <p className='text-white text-sm font-normal font-sans leading-normal'>
                    Sign up for a free account to save listings, get alerts, or
                    contact sellers directly.
                  </p>
                </div>

                {/* Step 3 */}
                <div className='text-center'>
                  <div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6'>
                    <Image
                      src={HowIcon3.src}
                      alt='How It Works'
                      width={100}
                      height={100}
                    />
                  </div>
                  <h3 className='text-white text-lg font-normal font-sans leading-7 mb-4'>
                    Post or Contact Seller
                  </h3>
                  <p className='text-white text-sm font-normal font-sans leading-normal'>
                    List your items for sale or reach out to sellers about
                    listings you&apos;re interested in.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Listings */}
          <section className='bg-slate-50 py-24'>
            <div className='max-w-7xl mx-auto px-6'>
              <div className='flex items-center justify-between mb-12'>
                <h2 className='text-gray-900 text-3xl font-medium font-sans leading-9'>
                  Featured Listings
                </h2>
                <div className='flex gap-6'>
                  <button
                    onClick={() => setActiveFilter('latest')}
                    className={`text-base font-sans ${
                      activeFilter === 'latest'
                        ? 'text-green-600 font-medium'
                        : 'text-gray-600 font-normal hover:text-green-600'
                    }`}
                  >
                    Latest Listings
                  </button>
                  <button
                    onClick={() => setActiveFilter('most-viewed')}
                    className={`text-base font-sans ${
                      activeFilter === 'most-viewed'
                        ? 'text-green-600 font-medium'
                        : 'text-gray-600 font-normal hover:text-green-600'
                    }`}
                  >
                    Most Viewed
                  </button>
                  <button
                    onClick={() => setActiveFilter('price-high')}
                    className={`text-base font-sans ${
                      activeFilter === 'price-high'
                        ? 'text-green-600 font-medium'
                        : 'text-gray-600 font-normal hover:text-green-600'
                    }`}
                  >
                    Price: High to Low
                  </button>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className='bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse'
                    >
                      <div className='w-full h-48 bg-gray-200'></div>
                      <div className='p-4'>
                        <div className='h-4 bg-gray-200 rounded mb-2'></div>
                        <div className='h-6 bg-gray-200 rounded w-1/2 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-3/4 mb-3'></div>
                        <div className='h-3 bg-gray-200 rounded'></div>
                      </div>
                    </div>
                  ))
                ) : featuredListings.length > 0 ? (
                  featuredListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/listing/${listing.slug || listing.id}`}
                    >
                      <ListingCard listing={listing} />
                    </Link>
                  ))
                ) : (
                  <div className='col-span-full text-center py-12'>
                    <p className='text-gray-500 text-base'>
                      No listings available at the moment.
                    </p>
                  </div>
                )}
              </div>

              <div className='text-center'>
                <Link
                  href='/browse-listings'
                  className='bg-gray-900 text-white text-base font-normal font-sans px-8 py-3 rounded-md'
                >
                  View All Listings
                </Link>
              </div>
            </div>
          </section>

          {/* Testimonials */}
          <section className='py-24'>
            <div className='max-w-7xl mx-auto px-6'>
              <div className='text-center mb-16'>
                <h2 className='text-gray-900 text-4xl font-normal font-sans leading-9'>
                  What Our Users Say
                </h2>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                {/* Testimonial 1 */}
                <div className='bg-green-600/10 rounded-xl p-8'>
                  <div className='flex items-start gap-6'>
                    <div className='w-20 h-20 '>
                      <Image
                        src={BlackQuote.src}
                        alt='Black Quote'
                        width={100}
                        height={100}
                      />
                    </div>
                    <div>
                      <div className='mb-6'>
                        <p className='text-black text-lg font-normal font-sans leading-7 mb-4'>
                          Found my dream setup in 2 days. The marketplace made
                          it easy to find exactly what I was looking for at a
                          fair price.
                        </p>
                      </div>
                      <div>
                        <p className='text-black text-base font-normal font-sans mb-1'>
                          — Jason
                        </p>
                        <p className='text-gray-600 text-base font-normal font-sans'>
                          Firefighter, Ohio
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className='bg-green-600/10 rounded-xl p-8'>
                  <div className='flex items-start gap-6'>
                    <div className='w-20 h-20 '>
                      <Image
                        src={BlackQuote.src}
                        alt='Black Quote'
                        width={100}
                        height={100}
                      />
                    </div>
                    <div>
                      <div className='mb-6'>
                        <p className='text-black text-lg font-normal font-sans leading-7 mb-4'>
                          Sold my whole business in under a week. I was
                          surprised by how quickly I found a serious buyer
                          through the platform.
                        </p>
                      </div>
                      <div>
                        <p className='text-black text-base font-normal font-sans mb-1'>
                          — Mark
                        </p>
                        <p className='text-gray-600 text-base font-normal font-sans'>
                          San Diego
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className='bg-slate-50 py-24'>
            <div className='max-w-7xl mx-auto px-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
                {/* Left Content */}
                <div className='space-y-6'>
                  <h2 className='text-gray-900 text-4xl font-normal font-sans leading-9'>
                    Ready to grow your business?
                  </h2>
                  <p className='text-gray-600 text-lg font-normal font-sans leading-7'>
                    Join thousands of pressure washing and bin cleaning
                    professionals who are buying and selling equipment, parts,
                    and entire businesses on our marketplace.
                  </p>
                  <div className='space-y-4'>
                    <Link href={'/dashboard/post-new-listing'}>
                      <button className='bg-green-600 text-white text-base font-normal font-sans px-8 py-3 rounded-md flex items-center gap-2'>
                        Post a Listing
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M17 8l4 4m0 0l-4 4m4-4H3'
                          />
                        </svg>
                      </button>
                    </Link>
                    <p className='text-gray-600 text-sm font-normal font-sans leading-tight mt-1'>
                      Free to post, only pay when you sell
                    </p>
                  </div>
                </div>

                {/* Right Image */}
                <div className='rounded-lg overflow-hidden'>
                  <Image
                    src={Image1.src}
                    alt='Ready to grow business'
                    width={600}
                    height={384}
                    className='w-full h-96 object-cover'
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
}
