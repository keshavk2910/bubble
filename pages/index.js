import Image from 'next/image';
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
  return (
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
                A search-first marketplace for pressure washing and bin cleaning
                businesses. Trucks, parts, or entire companies — all in one
                place.
              </p>
              <button className='bg-green-600 text-white text-base font-normal font-sans px-8 py-3 rounded-md'>
                Get Started
              </button>
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
                  placeholder='Search by keyword or ZIP code (e.g. 90210, trailer, Texas)'
                  className='w-full pl-12 pr-4 py-3 border border-gray-200 rounded-md text-gray-400 text-base font-normal font-sans'
                />
              </div>
              <div className='flex gap-4'>
                <select className='bg-white border border-gray-200 rounded-md px-4 py-3 text-black text-base font-normal font-sans'>
                  <option>All Categories</option>
                </select>
                <button className='bg-green-600 text-white text-base font-normal font-sans px-6 py-3 rounded-md'>
                  Search
                </button>
              </div>
            </div>
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
                <button className='text-green-600 text-base font-medium font-sans'>
                  Latest Listings
                </button>
                <button className='text-gray-600 text-base font-normal font-sans'>
                  Most Viewed
                </button>
                <button className='text-gray-600 text-base font-normal font-sans'>
                  Price: High to Low
                </button>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12'>
              {/* Listing 1 */}
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='relative'>
                  <Image
                    src='/FRAME.png'
                    alt='2018 Pressure Pro Truck Mount'
                    width={384}
                    height={192}
                    className='w-full h-48 object-cover'
                  />
                  <span className='absolute top-3 left-3 bg-orange-500 text-white text-xs font-normal font-sans px-3 py-1 rounded-lg'>
                    Featured
                  </span>
                </div>
                <div className='p-4'>
                  <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
                    2018 Pressure Pro Truck Mount
                  </h3>
                  <p className='text-green-600 text-xl font-medium font-sans leading-7 mb-2'>
                    $42,500
                  </p>
                  <div className='flex items-center gap-2 mb-3'>
                    <svg
                      className='w-3.5 h-3.5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-gray-600 text-sm font-normal font-sans leading-tight'>
                      Denver, CO 80014
                    </span>
                  </div>
                  <p className='text-gray-700 text-sm font-normal font-sans leading-tight'>
                    Excellent condition with only 1,200 hours. Includes all
                    hoses and accessories.
                  </p>
                </div>
              </div>

              {/* Listing 2 */}
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='relative'>
                  <div className='w-full h-48 bg-gray-200'></div>
                  <span className='absolute top-3 left-3 bg-white/90 text-black text-xs font-normal font-sans px-3 py-1 rounded-lg'>
                    Business
                  </span>
                </div>
                <div className='p-4'>
                  <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
                    Complete Bin Cleaning Business
                  </h3>
                  <p className='text-green-600 text-xl font-medium font-sans leading-7 mb-2'>
                    $85,000
                  </p>
                  <div className='flex items-center gap-2 mb-3'>
                    <svg
                      className='w-3.5 h-3.5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-gray-600 text-sm font-normal font-sans leading-tight'>
                      Austin, TX 73301
                    </span>
                  </div>
                  <p className='text-gray-700 text-sm font-normal font-sans leading-tight'>
                    Established business with regular clients and all necessary
                    equipment included.
                  </p>
                </div>
              </div>

              {/* Listing 3 */}
              <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
                <div className='relative'>
                  <Image
                    src='/FRAME-2.png'
                    alt='Commercial Pressure Washer'
                    width={384}
                    height={192}
                    className='w-full h-48 object-cover'
                  />
                  <span className='absolute top-3 left-3 bg-white/90 text-black text-xs font-normal font-sans px-3 py-1 rounded-lg'>
                    Equipment
                  </span>
                </div>
                <div className='p-4'>
                  <h3 className='text-gray-700 text-lg font-normal font-sans leading-7 mb-2'>
                    Commercial Pressure Washer - 4000 PSI
                  </h3>
                  <p className='text-green-600 text-xl font-medium font-sans leading-7 mb-2'>
                    $2,750
                  </p>
                  <div className='flex items-center gap-2 mb-3'>
                    <svg
                      className='w-3.5 h-3.5'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z'
                        clipRule='evenodd'
                      />
                    </svg>
                    <span className='text-gray-600 text-sm font-normal font-sans leading-tight'>
                      Seattle, WA 98101
                    </span>
                  </div>
                  <p className='text-gray-700 text-sm font-normal font-sans leading-tight'>
                    Honda engine, hot water capability, low hours, perfect
                    working condition.
                  </p>
                </div>
              </div>
            </div>

            <div className='text-center'>
              <button className='bg-gray-900 text-white text-base font-normal font-sans px-8 py-3 rounded-md'>
                View All Listings
              </button>
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
                        Found my dream setup in 2 days. The marketplace made it
                        easy to find exactly what I was looking for at a fair
                        price.
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
                        Sold my whole business in under a week. I was surprised
                        by how quickly I found a serious buyer through the
                        platform.
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
                  professionals who are buying and selling equipment, parts, and
                  entire businesses on our marketplace.
                </p>
                <div className='space-y-4'>
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
                  <p className='text-gray-600 text-sm font-normal font-sans leading-tight'>
                    Free to post, only pay when you sell
                  </p>
                </div>
              </div>

              {/* Right Image */}
              <div className='rounded-lg overflow-hidden'>
                <Image
                  src='/Unsplash Image.png'
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
  );
}
