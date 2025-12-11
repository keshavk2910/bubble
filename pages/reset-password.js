import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import Logo from '../components/Images/logoTest.png';
import Image from 'next/image';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [accessToken, setAccessToken] = useState('');

  // Extract access token from URL hash or query params
  useEffect(() => {
    // Supabase redirects with token in URL hash after clicking the verify link
    const hash = window.location.hash;
    const search = window.location.search;

    // Try to get token from hash first (Supabase default behavior)
    let token = null;
    let type = null;

    if (hash) {
      const hashParams = new URLSearchParams(hash.substring(1));
      token = hashParams.get('access_token');
      type = hashParams.get('type');
    }

    // Fallback to query params if not in hash
    if (!token && search) {
      const queryParams = new URLSearchParams(search);
      token = queryParams.get('access_token');
      type = queryParams.get('type');
    }

    if (type === 'recovery' && token) {
      setAccessToken(token);
      console.log('Reset token found:', token.substring(0, 20) + '...');
    } else if (hash || search) {
      console.error('Invalid token or type. Hash:', hash, 'Search:', search);
      setError('Invalid or expired reset link. Please request a new one.');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!accessToken) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.details || data.error || 'Failed to reset password');
        return;
      }

      setSuccess(true);

      // Redirect to sign-in after 3 seconds
      setTimeout(() => {
        router.push('/sign-in');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>Reset Password - Bins Buy Sell</title>
        <meta name='description' content='Create a new password for your account' />
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
                  Reset Your Password
                </h1>
                <p className='text-gray-600 text-base font-normal font-sans mb-6'>
                  Enter your new password below.
                </p>

                <form onSubmit={handleSubmit} className='space-y-6'>
                  {/* New Password */}
                  <div>
                    <label
                      htmlFor='password'
                      className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
                    >
                      New Password
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Lock className='w-4 h-4 text-gray-400' />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id='password'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Enter new password'
                        className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-12 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                        required
                        minLength={8}
                      />
                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute inset-y-0 right-0 pr-3 flex items-center'
                      >
                        {showPassword ? (
                          <EyeOff className='w-4 h-4 text-gray-400' />
                        ) : (
                          <Eye className='w-4 h-4 text-gray-400' />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor='confirmPassword'
                      className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
                    >
                      Confirm Password
                    </label>
                    <div className='relative'>
                      <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                        <Lock className='w-4 h-4 text-gray-400' />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id='confirmPassword'
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder='Confirm new password'
                        className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-12 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                        required
                        minLength={8}
                      />
                      <button
                        type='button'
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className='absolute inset-y-0 right-0 pr-3 flex items-center'
                      >
                        {showConfirmPassword ? (
                          <EyeOff className='w-4 h-4 text-gray-400' />
                        ) : (
                          <Eye className='w-4 h-4 text-gray-400' />
                        )}
                      </button>
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
                    disabled={isSubmitting || !accessToken}
                    className='w-full bg-green-600 text-white text-base font-normal font-sans py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
                  >
                    {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
                  </button>

                  {/* Back to Sign In */}
                  <div className='text-center'>
                    <Link
                      href='/sign-in'
                      className='text-green-600 text-sm font-normal font-sans hover:text-green-700 transition-colors'
                    >
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
                  Password Reset Successful!
                </h2>
                <p className='text-gray-600 text-base font-normal font-sans mb-6'>
                  Your password has been updated successfully. Redirecting you to sign in...
                </p>
                <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
