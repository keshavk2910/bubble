import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle, Mail } from 'lucide-react';
import Head from 'next/head';
export default function EmailVerified() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3);

  useEffect(() => {
    // Progress bar animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 100 / 30; // 30 steps over 3 seconds
      });
    }, 100);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push('/sign-in');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(countdownInterval);
    };
  }, [router]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6'>
      <Head>
        <title>Email Verified - Bins Buy Sell</title>
        <meta
          name='description'
          content='Your email has been successfully verified.'
        />
      </Head>
      <div className='w-full max-w-md'>
        {/* Email Verified Card */}
        <div className='bg-white rounded-xl border border-gray-200 p-8 text-center'>
          {/* Success Icon */}
          <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6'>
            <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-8 h-8 text-white' />
            </div>
          </div>

          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-gray-900 text-3xl font-bold font-sans mb-4'>
              Email Verified!
            </h1>
            <p className='text-gray-600 text-base font-normal font-sans leading-normal'>
              Your email has been successfully verified. You can now access all
              features of Bins Buy Sell.
            </p>
          </div>

          {/* Email Info */}
          <div className='bg-green-50 rounded-xl p-4 mb-8'>
            <div className='flex items-center justify-center gap-3'>
              <Mail className='w-5 h-5 text-green-600' />
              <span className='text-green-800 text-sm font-medium'>
                Email verification complete
              </span>
            </div>
          </div>

          {/* Progress Section */}
          <div className='mb-6'>
            <div className='flex items-center justify-between mb-2'>
              <span className='text-gray-700 text-sm font-medium'>
                Redirecting to sign in...
              </span>
              <span className='text-green-600 text-sm font-bold'>
                {timeLeft}s
              </span>
            </div>

            {/* Progress Bar */}
            <div className='w-full bg-gray-200 rounded-full h-2 overflow-hidden'>
              <div
                className='bg-green-600 h-2 rounded-full transition-all duration-100 ease-out'
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Manual Redirect Button */}
          <button
            onClick={() => router.push('/sign-in')}
            className='w-full bg-green-600 text-white text-base font-normal font-sans py-3 rounded-xl hover:bg-green-700 transition-colors'
          >
            Continue to Sign In
          </button>

          {/* Footer Note */}
          <p className='text-gray-500 text-xs font-normal font-sans mt-4'>
            You will be automatically redirected in {timeLeft} seconds
          </p>
        </div>
      </div>
    </div>
  );
}
