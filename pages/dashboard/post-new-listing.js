import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DashboardLayout from '../../components/DashboardLayout';
import ListingForm from '../../components/ListingForm';
import Head from 'next/head';
export default function PostNewListing() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Check email verification on page load
  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/post-new-listing');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        const response = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setUserProfile(userData.profile);
        } else {
          router.push('/sign-in?redirect=/dashboard/post-new-listing');
        }
      } catch (error) {
        console.error('Profile check error:', error);
        router.push('/sign-in?redirect=/dashboard/post-new-listing');
      } finally {
        setIsLoading(false);
      }
    };

    checkEmailVerification();
  }, [router]);

  const handleSubmitSuccess = (data) => {
    setSubmitSuccess(true);

    // Redirect to dashboard after success
    setTimeout(() => {
      router.push('/dashboard/user?highlight=listings');
    }, 3000);
  };

  if (isLoading) {
    return (
      <DashboardLayout title='Post New Listing' subtitle='Loading...'>
        <div className='flex items-center justify-center py-12'>
          <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
      </DashboardLayout>
    );
  }

  // Show email verification requirement
  if (!userProfile?.email_verified) {
    return (
      <DashboardLayout
        title='Email Verification Required'
        subtitle='Verify your email to create listings'
      >
        <div className='max-w-2xl mx-auto text-center py-12'>
          <div className='bg-yellow-50 border border-yellow-200 rounded-xl p-8'>
            <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <svg
                className='w-8 h-8 text-yellow-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-yellow-800 text-2xl font-bold font-sans mb-4'>
              Email Verification Required
            </h2>
            <p className='text-yellow-700 text-base font-normal font-sans mb-6'>
              To create listings on our marketplace, you need to verify your
              email address.
            </p>
            <button
              onClick={() => router.push('/dashboard/user')}
              className='bg-gray-100 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-200 transition-colors'
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Success state
  if (submitSuccess) {
    return (
      <DashboardLayout
        title='Listing Submitted'
        subtitle='Your listing has been submitted successfully'
      >
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
              Listing Submitted Successfully!
            </h2>
            <p className='text-green-700 text-base font-normal font-sans mb-4'>
              Your listing has been submitted for review. Our admin team will
              review it and approve it within 24 hours.
            </p>
            <p className='text-green-600 text-sm font-normal font-sans'>
              Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title='Post New Listing'
      subtitle='Create a new listing to sell your equipment or business'
    >
      <Head>
        <title>Post New Listing - Bins Buy Sell</title>
        <meta
          name='description'
          content='Create a new listing to sell your equipment or business'
        />
      </Head>
      <div className='max-w-4xl mx-auto'>
        <div className='mb-8'>
          <h1 className='text-gray-900 text-4xl font-bold font-sans mb-2'>
            Got Something to Sell?
          </h1>
          <p className='text-gray-600 text-base font-normal font-sans leading-normal'>
            Complete the form below to list your item on Bin Buy Sell
          </p>
        </div>

        <ListingForm isEdit={false} onSubmitSuccess={handleSubmitSuccess} />
      </div>
    </DashboardLayout>
  );
}
