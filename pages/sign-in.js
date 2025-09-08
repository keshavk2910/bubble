import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import Logo from '../components/Images/logo.svg';
import Image from 'next/image';

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errors, setErrors] = useState({});

  // Check if user is already signed in
  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (session) {
          const sessionData = JSON.parse(session);
          const token = sessionData.access_token;

          // Verify session is still valid
          const response = await fetch('/api/me', {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            // User is authenticated, redirect to dashboard
            router.push('/dashboard');
          } else {
            // Session invalid, clear it
            localStorage.removeItem('supabase_session');
            localStorage.removeItem('user_profile');
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };

    checkAuthentication();
  }, [router]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSigningIn(true);
    setErrors({});

    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.status != 200) {
        // Handle phone verification requirement
        if (data.requires_phone_verification) {
          // Store temporary profile and session for verification page
          localStorage.setItem(
            'temp_unverified_profile',
            JSON.stringify(data.user_profile)
          );
          localStorage.setItem(
            'temp_session',
            JSON.stringify(data.temp_session)
          );
          router.push('/verify-phone-required');
          return;
        }

        setErrors({ submit: data.details || data.error || 'Sign in failed' });
        return;
      }

      // Store session data in localStorage or context
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
        localStorage.setItem('user_profile', JSON.stringify(data.user.profile));
      }

      // Redirect to dashboard or intended page
      const redirectTo = router.query.redirect || '/dashboard';
      router.push(redirectTo);
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({
        submit: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In - Bin Cleaning Classifieds</title>
        <meta
          name='description'
          content='Sign in to your account to manage listings, messages, and account settings.'
        />
      </Head>
      <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6'>
        <div className='w-full max-w-md'>
          {/* Sign In Card */}
          <div className='bg-white rounded-xl border border-gray-200 p-8'>
            {/* Logo */}
            <div className='text-center mb-8 flex justify-center'>
              <Link href='/'>
                <Image src={Logo.src} alt='Logo' width={300} height={300} />
              </Link>
            </div>

            {/* Header */}
            <div className='text-center mb-8'>
              <h2 className='text-gray-700 text-3xl font-normal font-sans leading-9 mb-4'>
                Welcome Back
              </h2>
              <p className='text-gray-500 text-base font-normal font-sans leading-normal'>
                Sign in to access your account.
              </p>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Email */}
              <div>
                <label
                  htmlFor='email'
                  className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
                >
                  Email
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Mail className='w-4 h-4 text-gray-400' />
                  </div>
                  <input
                    type='email'
                    id='email'
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder='Enter your email'
                    className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-sm font-normal font-sans leading-tight focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                    required
                  />
                </div>
                {errors.email && (
                  <div className='flex items-center gap-2 mt-2'>
                    <AlertCircle className='w-4 h-4 text-red-500' />
                    <span className='text-red-500 text-sm font-normal font-sans'>
                      {errors.email}
                    </span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor='password'
                  className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
                >
                  Password
                </label>
                <div className='relative'>
                  <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                    <Lock className='w-4 h-4 text-gray-400' />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id='password'
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange('password', e.target.value)
                    }
                    placeholder='Enter your password'
                    className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-12 py-3 text-gray-700 text-sm font-normal font-sans leading-tight focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                    required
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5 text-green-600 hover:text-green-700' />
                    ) : (
                      <Eye className='w-5 h-5 text-green-600 hover:text-green-700' />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className='flex items-center gap-2 mt-2'>
                    <AlertCircle className='w-4 h-4 text-red-500' />
                    <span className='text-red-500 text-sm font-normal font-sans'>
                      {errors.password}
                    </span>
                  </div>
                )}
              </div>

              {/* Submit Error Message */}
              {errors.submit && (
                <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
                  <div className='flex items-center gap-2'>
                    <AlertCircle className='w-5 h-5 text-red-500' />
                    <span className='text-red-700 text-sm font-normal font-sans'>
                      {errors.submit}
                    </span>
                  </div>
                </div>
              )}

              {/* Forgot Password */}
              <div className='text-right'>
                <Link
                  href='/forgot-password'
                  className='text-green-600 text-sm font-normal font-sans leading-tight hover:text-green-700 transition-colors'
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type='submit'
                disabled={isSigningIn}
                className='w-full bg-green-600 text-white text-base font-normal font-sans leading-normal py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center'
              >
                {isSigningIn ? (
                  <>
                    <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2'></div>
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Sign Up Link */}
              <div className='text-center pt-4'>
                <span className='text-gray-700 text-sm font-normal font-sans leading-tight'>
                  Don&apos;t have an account?{' '}
                </span>
                <Link
                  href='/register'
                  className='text-green-600 text-sm font-normal font-sans leading-tight hover:text-green-700 transition-colors'
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
