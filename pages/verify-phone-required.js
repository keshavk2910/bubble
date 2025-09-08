import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Phone, CheckCircle, ArrowLeft, Send } from 'lucide-react';
import SmsVerificationModal from '../components/SmsVerificationModal';
import Head from 'next/head';
export default function VerifyPhoneRequired() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState(null);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        // Get user profile from localStorage (passed from sign-in attempt)
        const tempProfile = localStorage.getItem('temp_unverified_profile');
        if (!tempProfile) {
          router.push('/sign-in');
          return;
        }

        const profile = JSON.parse(tempProfile);
        console.log(profile);
        setUserProfile(profile);

        // If phone is already verified, redirect to dashboard
        if (profile.phone_verified) {
          localStorage.removeItem('temp_unverified_profile');
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Verification check error:', error);
        router.push('/sign-in');
      } finally {
        setIsLoading(false);
      }
    };

    checkUserStatus();
  }, [router]);

  const handleStartVerification = () => {
    setShowSmsModal(true);
  };

  const handleSmsVerified = async () => {
    console.log('Phone verification completed!');
    setShowSmsModal(false);

    try {
      // Get session and complete login flow
      const tempSession = localStorage.getItem('temp_session');
      if (tempSession) {
        localStorage.setItem('supabase_session', tempSession);
        localStorage.removeItem('temp_session');
        localStorage.removeItem('temp_unverified_profile');

        // Redirect to dashboard
        router.push('/dashboard');
      } else {
        // Redirect to sign-in if no session
        router.push('/sign-in');
      }
    } catch (error) {
      console.error('Post-verification redirect error:', error);
      router.push('/sign-in');
    }
  };

  const handleCloseModal = () => {
    setShowSmsModal(false);
  };

  const handleBackToSignIn = () => {
    localStorage.removeItem('temp_unverified_profile');
    localStorage.removeItem('temp_session');
    router.push('/sign-in');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Phone Verification Required - Bin Cleaning Classifieds</title>
        <meta
          name='description'
          content='To ensure the security of our marketplace, please verify your phone number before accessing your account.'
        />
      </Head>
      <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6'>
        <div className='w-full max-w-md'>
          {/* Verification Required Card */}
          <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
            {/* Back Button */}
            <button
              onClick={handleBackToSignIn}
              className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6'
            >
              <ArrowLeft className='w-4 h-4' />
              Back to Sign In
            </button>

            {/* Phone Verification Icon */}
            <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Phone className='w-8 h-8 text-yellow-600' />
            </div>

            {/* Header */}
            <div className='mb-8'>
              <h2 className='text-gray-900 text-2xl font-bold font-sans mb-4'>
                Phone Verification Required
              </h2>
              <p className='text-gray-600 text-base font-normal font-sans leading-normal'>
                To ensure the security of our marketplace, please verify your
                phone number before accessing your account.
              </p>
            </div>

            {/* User Info */}
            <div className='bg-gray-50 rounded-xl p-4 mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-700 text-sm font-medium'>
                  Account:
                </span>
                <span className='text-gray-900 text-sm'>
                  {userProfile?.full_name}
                </span>
              </div>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-gray-700 text-sm font-medium'>
                  Email:
                </span>
                <div className='flex items-center gap-2'>
                  {userProfile?.email_verified ? (
                    <CheckCircle className='w-4 h-4 text-green-600' />
                  ) : (
                    <div className='w-4 h-4 border-2 border-yellow-500 rounded-full flex items-center justify-center'>
                      <div className='w-1.5 h-1.5 bg-yellow-500 rounded-full'></div>
                    </div>
                  )}
                  <span className='text-gray-900 text-sm'>
                    {userProfile?.email}
                  </span>
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-gray-700 text-sm font-medium'>
                  Phone:
                </span>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 border-2 border-yellow-500 rounded-full flex items-center justify-center'>
                    <div className='w-1.5 h-1.5 bg-yellow-500 rounded-full'></div>
                  </div>
                  <span className='text-gray-900 text-sm'>
                    {userProfile?.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Button */}
            <button
              onClick={handleStartVerification}
              className='w-full bg-green-600 text-white text-base font-normal font-sans py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 mb-4'
            >
              <Send className='w-4 h-4' />
              Send Verification Code
            </button>

            <p className='text-gray-500 text-sm font-normal font-sans'>
              A verification code will be sent to your phone number via SMS.
            </p>
          </div>
        </div>

        {/* SMS Verification Modal */}
        <SmsVerificationModal
          isOpen={showSmsModal}
          onClose={handleCloseModal}
          phoneNumber={userProfile?.phone}
          onVerified={handleSmsVerified}
        />
      </div>
    </>
  );
}
