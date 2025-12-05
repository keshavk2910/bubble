import Image from 'next/image';
import Layout from '@/components/Layout';
import Head from 'next/head';
import Link from 'next/link';
export default function OurMission() {
  return (
    <Layout>
      <Head>
        <title>Our Mission - Bins Buy Sell</title>
        <meta
          name='description'
          content='Our mission is to create the most straightforward marketplace for bin cleaning professionals to buy, sell, and grow their businesses.'
        />
      </Head>
      <div className='w-full bg-white overflow-hidden'>
        {/* Hero Section */}
        <section className='relative w-full h-96 bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] overflow-hidden'>
          <div className='w-full h-96 absolute bg-gray-200'></div>
          <Image
            src='/Unsplash Image.png'
            alt='Bin cleaning professionals'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-black bg-opacity-60'></div>

          <div className='w-[768px] h-64 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'>
            <div className='text-center'>
              <h1 className='text-white text-4xl font-medium font-sans leading-10 mb-6'>
                Connecting the Bin Cleaning Industry
              </h1>
              <div className='w-[535px] mx-auto mb-8'>
                <p className='text-stone-300 text-xl font-normal font-sans leading-7'>
                  Revolutionizing how waste management professionals connect,
                  trade, and grow
                </p>
              </div>
              <div className='w-64 h-12 mx-auto'>
                <button className='w-full h-12 bg-green-600 rounded-xl text-white text-lg font-normal font-sans hover:bg-green-700 transition-colors'>
                  Explore Opportunities
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className='w-full h-96 py-20'>
          <div className='w-[896px] h-60 mx-auto px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-gray-700 text-4xl font-normal font-sans leading-10 mb-8'>
                Our Mission
              </h2>
              <div className='w-[892px] mx-auto mb-8'>
                <p className='text-gray-700 text-2xl font-normal font-sans leading-loose'>
                  To create the most straightforward marketplace for bin
                  cleaning professionals to buy, sell, and grow their
                  businesses.
                </p>
              </div>
              <div className='w-[768px] mx-auto'>
                <div className='w-[668px] mx-auto'>
                  <p className='text-gray-700 text-lg font-normal font-sans leading-7'>
                    We believe in cutting through the noise and providing a
                    platform where industry professionals can connect without
                    barriers. No fluff, no gatekeeping—just real opportunities
                    for real people in the bin cleaning industry.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Industry-Specific Focus Section */}
        <section className='w-full h-80 bg-white py-16'>
          <div className='w-[1376px] mx-auto px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-gray-700 text-3xl font-normal font-sans leading-9'>
                Industry-Specific Focus
              </h2>
            </div>

            <div className='w-[1376px] h-36 relative flex justify-center gap-20'>
              {/* Specialized Trucks */}
              <div className='w-36 h-36 flex flex-col items-center'>
                <div className='w-24 h-24 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6'>
                  <div className='w-12 h-10'>
                    <Image
                      src='/SVG-1.svg'
                      alt='Specialized Trucks'
                      width={48}
                      height={40}
                      className='w-full h-full'
                    />
                  </div>
                </div>
                <h3 className='text-gray-700 text-base font-normal font-sans leading-normal text-center'>
                  Specialized Trucks
                </h3>
              </div>

              {/* Equipment */}
              <div className='w-36 h-36 flex flex-col items-center'>
                <div className='w-24 h-24 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6'>
                  <div className='w-12 h-11'>
                    <Image
                      src='/SVG-2.svg'
                      alt='Equipment'
                      width={48}
                      height={44}
                      className='w-full h-full'
                    />
                  </div>
                </div>
                <h3 className='text-gray-700 text-base font-normal font-sans leading-normal text-center'>
                  Equipment
                </h3>
              </div>

              {/* Businesses */}
              <div className='w-28 h-36 flex flex-col items-center'>
                <div className='w-24 h-24 bg-white rounded-xl border border-gray-200 flex items-center justify-center mb-6'>
                  <div className='w-12 h-10'>
                    <Image
                      src='/company-enterprise-icon 1.svg'
                      alt='Businesses'
                      width={48}
                      height={40}
                      className='w-full h-full'
                    />
                  </div>
                </div>
                <h3 className='text-gray-700 text-base font-normal font-sans leading-normal text-center'>
                  Businesses
                </h3>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Our Marketplace Section */}
        <section className='w-full h-[626px] bg-slate-50 py-16'>
          <div className='w-[1376px] mx-auto px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-gray-700 text-3xl font-normal font-sans leading-9'>
                Why Choose Our Marketplace
              </h2>
            </div>

            <div className='w-[1024px] h-96 mx-auto'>
              <div className='grid grid-cols-2 gap-8'>
                {/* Industry Expertise */}
                <div className='w-[496px] h-48 bg-white rounded-xl border border-gray-200 p-6'>
                  <div className='w-9 h-9 mb-4'>
                    <Image
                      src='/SVG-3.svg'
                      alt='Industry Expertise'
                      width={36}
                      height={36}
                      className='w-full h-full'
                    />
                  </div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Industry Expertise
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Built by professionals who understand the unique challenges
                    and opportunities in bin cleaning businesses.
                  </p>
                </div>

                {/* Direct Connections */}
                <div className='w-[496px] h-48 bg-white rounded-xl border border-gray-200 p-6'>
                  <div className='w-9 h-7 mb-4'>
                    <Image
                      src='/SVG-4.svg'
                      alt='Direct Connections'
                      width={36}
                      height={28}
                      className='w-full h-full'
                    />
                  </div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Direct Connections
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Connect directly with serious buyers and sellers without
                    intermediaries or unnecessary fees.
                  </p>
                </div>

                {/* Transparent Process */}
                <div className='w-[496px] h-48 bg-white rounded-xl border border-gray-200 p-6'>
                  <div className='w-9 h-9 mb-4'>
                    <Image
                      src='/SVG-5.svg'
                      alt='Transparent Process'
                      width={36}
                      height={36}
                      className='w-full h-full'
                    />
                  </div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Transparent Process
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Clear, straightforward listings with all the information you
                    need to make informed decisions.
                  </p>
                </div>

                {/* Community Support */}
                <div className='w-[496px] h-48 bg-white rounded-xl border border-gray-200 p-6'>
                  <div className='w-9 h-7 mb-4'>
                    <Image
                      src='/Group 19.svg'
                      alt='Community Support'
                      width={36}
                      height={28}
                      className='w-full h-full'
                    />
                  </div>
                  <h3 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-4'>
                    Community Support
                  </h3>
                  <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
                    Join a network of industry professionals who share
                    knowledge, resources, and opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className='w-full h-80 bg-gray-900 py-16'>
          <div className='w-[1376px] mx-auto px-8'>
            <div className='text-center mb-16'>
              <h2 className='text-white text-3xl font-normal font-sans leading-9 mb-6'>
                Ready to join our community?
              </h2>
              <div className='w-[672px] mx-auto'>
                <p className='text-white text-lg font-normal font-sans leading-7'>
                  Whether you&apos;re looking to expand your business, sell
                  equipment, or connect with industry peers, we&apos;ve got you
                  covered.
                </p>
              </div>
            </div>

            <div className='flex justify-center gap-4'>
              <div className='w-40 h-12'>
                <Link href='/dashboard/post-new-listing'>
                  <button className='w-full h-12 bg-green-600 rounded-xl text-white text-base font-normal font-sans hover:bg-green-700 transition-colors'>
                    Post a Listing
                  </button>
                </Link>
              </div>
              <div className='w-48 h-12'>
                <Link href='/browse-listings'>
                  <button className='w-full h-12 bg-white rounded-xl border border-gray-900 text-gray-900 text-base font-normal font-sans hover:bg-gray-50 transition-colors'>
                    Browse Listings
                  </button>
                </Link>
              </div>
              <div className='w-36 h-12'>
                <Link href='/our-mission'>
                  <button className='w-full h-12 bg-gray-100/5 rounded-xl border border-white text-white text-base font-normal font-sans hover:bg-white hover:text-gray-900 transition-colors'>
                    Learn More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
