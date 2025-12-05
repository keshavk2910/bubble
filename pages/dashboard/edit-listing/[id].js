import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import DashboardLayout from '../../../components/DashboardLayout';
import ListingForm from '../../../components/ListingForm';
import Head from 'next/head';

export default function EditListing() {
  const router = useRouter();
  const { id } = router.query;
  const [listingData, setListingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    const loadListing = async () => {
      if (!id) return;

      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/user');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Get the specific listing
        const response = await fetch(`/api/listings?limit=50`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch listing');
        }

        const data = await response.json();
        const listing = data.listings.find((l) => l.id === id);

        if (!listing) {
          router.push('/dashboard/user');
          return;
        }

        setListingData(listing);
      } catch (error) {
        console.error('Load listing error:', error);
        router.push('/dashboard/user');
      } finally {
        setIsLoading(false);
      }
    };

    loadListing();
  }, [id, router]);

  const handleSubmitSuccess = (data) => {
    setSubmitSuccess(true);

    // Redirect back to dashboard
    setTimeout(() => {
      router.push('/dashboard/user?highlight=listings');
    }, 2000);
  };

  if (isLoading) {
    return (
      <DashboardLayout
        title='Edit Listing'
        subtitle='Update your listing information'
      >
        <Head>
          <title>Edit Listing - Bins Buy Sell</title>
          <meta name='description' content='Update your listing information' />
        </Head>
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='w-8 h-8 text-green-600 animate-spin' />
        </div>
      </DashboardLayout>
    );
  }

  if (!listingData) {
    return (
      <DashboardLayout
        title='Listing Not Found'
        subtitle='The requested listing could not be found'
      >
        <Head>
          <title>Listing Not Found - Bins Buy Sell</title>
          <meta
            name='description'
            content='The requested listing could not be found'
          />
        </Head>
        <div className='text-center py-12'>
          <p className='text-gray-600 mb-4'>
            The listing you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to edit it.
          </p>
          <button
            onClick={() => router.push('/dashboard/user')}
            className='bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors'
          >
            Back to Dashboard
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Success state
  if (submitSuccess) {
    return (
      <DashboardLayout
        title='Listing Updated'
        subtitle='Your listing has been updated successfully'
      >
        <Head>
          <title>Listing Updated - Bins Buy Sell</title>
          <meta
            name='description'
            content='Your listing has been updated successfully'
          />
        </Head>
        <div className='max-w-2xl mx-auto text-center py-12'>
          <div className='bg-green-50 border border-green-200 rounded-xl p-8'>
            <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6'>
              <svg
                className='w-8 h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
            </div>
            <h2 className='text-green-800 text-2xl font-bold font-sans mb-4'>
              Listing Updated Successfully!
            </h2>
            <p className='text-green-700 text-base font-normal font-sans'>
              Your changes have been saved. Redirecting to dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title='Edit Listing'
      subtitle='Update your listing information'
    >
      <Head>
        <title>Edit Listing - Bins Buy Sell</title>
        <meta name='description' content='Update your listing information' />
      </Head>
      <div className='max-w-4xl mx-auto'>
        {/* Back Button */}
        <button
          onClick={() => router.push('/dashboard/user')}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6'
        >
          <ArrowLeft className='w-4 h-4' />
          Back to Listings
        </button>

        <ListingForm
          initialData={listingData}
          isEdit={true}
          listingId={id}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </div>
    </DashboardLayout>
  );
}
