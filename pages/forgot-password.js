import Head from 'next/head';
import { useState } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import Logo from '../components/Images/logoTest.png';
import Image from 'next/image';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || 'Failed to send reset email');
        return;
      }

      setSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Bins Buy Sell</title>
        <meta name='description' content='Reset your password' />
      </Head>

      <div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          {/* Logo */}
          <div className='text-center mb-8'>
            <Link href='/'>
              <Image
                src={Logo.src}
                alt='Bins Buy Sell'
                width={120}
                height={40}
                className='mx-auto mb-4'
              />
            </Link>
          </div>

          {/* Card */}
          <div className='bg-white rounded-xl border border-gray-200 p-8'>
            {!success ? (
              <>
                <h1 className='text-gray-900 text-2xl font-semibold font-sans mb-2'>
                  Forgot Password?
                </h1>
                <p className='text-gray-600 text-base font-normal font-sans mb-6'>
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>

                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* Email Input */}
                  <div>
                    <label
                      htmlFor='email'
                      className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
                    >
                      Email Address
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Mail className='w-4 h-4 text-gray-400' />
                      </div>
                      <input
                        type='email'
                        id='email'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='Enter your email'
                        className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                        required
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                      <div className='flex items-center gap-2'>
                        <AlertCircle className='w-5 h-5 text-red-500' />
                        <span className='text-red-700 text-sm font-normal font-sans'>
                          {error}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full bg-green-600 text-white text-base font-normal font-sans py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                  </button>

                  {/* Back to Sign In */}
                  <div className='text-center'>
                    <Link
                      href='/sign-in'
                      className='inline-flex items-center gap-2 text-green-600 text-sm font-normal font-sans hover:text-green-700 transition-colors'
                    >
                      <ArrowLeft className='w-4 h-4' />
                      Back to Sign In
                    </Link>
                  </div>
                </form>
              </>
            ) : (
              <div className='text-center'>
                <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                  <CheckCircle className='w-8 h-8 text-green-600' />
                </div>
                <h2 className='text-gray-900 text-xl font-semibold font-sans mb-2'>
                  Check Your Email
                </h2>
                <p className='text-gray-600 text-base font-normal font-sans mb-6'>
                  We've sent a password reset link to{' '}
                  <span className='font-medium'>{email}</span>
                </p>
                <p className='text-gray-500 text-sm font-normal font-sans mb-6'>
                  Click the link in the email to reset your password. The link
                  will expire in 1 hour.
                </p>
                <Link
                  href='/sign-in'
                  className='inline-flex items-center gap-2 text-green-600 text-sm font-normal font-sans hover:text-green-700 transition-colors'
                >
                  <ArrowLeft className='w-4 h-4' />
                  Back to Sign In
                </Link>
              </div>
            )}
          </div>

          {/* Sign Up Link */}
          <div className='text-center mt-6'>
            <span className='text-gray-600 text-base font-normal font-sans'>
              Don't have an account?{' '}
            </span>
            <Link
              href='/register'
              className='text-green-600 text-base font-normal font-sans hover:text-green-700 transition-colors'
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
