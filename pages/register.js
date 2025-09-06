import { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  Check,
  User,
  Mail,
  Lock,
  MapPin,
  Phone,
  Globe,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import SmsVerificationModal from '../components/SmsVerificationModal';
import RegistrationSuccessModal from '../components/RegistrationSuccessModal';
import Logo from '../components/Images/logo.svg';
import Image from 'next/image';

export default function Register() {
  const countries = [
    { value: '', label: 'Select your country', flag: '🌍' },
    { value: 'US', label: 'United States', flag: '🇺🇸' },
    { value: 'CA', label: 'Canada', flag: '🇨🇦' },
    { value: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
    { value: 'AU', label: 'Australia', flag: '🇦🇺' },
    { value: 'OTHER', label: 'Other', flag: '🌐' },
  ];
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    country: '',
    zipCode: '',
    phone: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const calculatePasswordStrength = (password) => {
    if (!password) return '';
    if (password.length < 6) return 'weak';
    if (
      password.length >= 8 &&
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return 'strong';
    }
    return 'medium';
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'bg-green-600';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-200';
    }
  };

  const getStrengthWidth = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'w-full';
      case 'medium':
        return 'w-2/3';
      case 'weak':
        return 'w-1/3';
      default:
        return 'w-0';
    }
  };

  const getStrengthText = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'Strong password';
      case 'medium':
        return 'Medium password';
      case 'weak':
        return 'Weak password';
      default:
        return '';
    }
  };

  const getStrengthTextColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'weak':
        return 'text-red-600';
      default:
        return 'text-gray-400';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid ZIP code (12345 or 12345-6789)';
    }

    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.termsAccepted) {
      newErrors.terms =
        'You must accept the Terms of Service and Privacy Policy';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          country: formData.country,
          zipCode: formData.zipCode,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({
          submit: data.details || data.error || 'Registration failed',
        });
        return;
      }

      // Registration successful - show phone verification modal first
      setShowSmsModal(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({
        submit: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSmsVerified = async () => {
    console.log('SMS verification successful!');
    setShowSmsModal(false);
    
    // Now auto sign-in the user after phone verification
    await autoSignInUser(formData.email, formData.password);
  };

  const handleCloseModal = () => {
    setShowSmsModal(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
  };

  const autoSignInUser = async (email, password) => {
    try {
      const response = await fetch('/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Auto sign-in failed:', data);
        // If auto sign-in fails, just show success modal and let user manually sign in
        setShowSuccessModal(true);
        return;
      }

      // Store session data
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session));
        localStorage.setItem('user_profile', JSON.stringify(data.user.profile));
      }

      // Show success modal, then redirect to dashboard
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Auto sign-in error:', error);
      // If auto sign-in fails, just show success modal
      setShowSuccessModal(true);
    }
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6'>
      <div className='w-full max-w-md'>
        {/* Registration Card */}
        <div className='bg-white rounded-xl border border-gray-200 p-8'>
          {/* Header */}
          <div className='mb-8 flex justify-center'>
            <Link href='/'>
              <Image src={Logo.src} alt='Logo' width={300} height={300} />
            </Link>
          </div>
          <div className='text-center mb-8'>
            <h2 className='text-gray-700 text-4xl font-normal font-sans leading-9 mb-4'>
              Join the Marketplace —<br /> It&apos;s Free
            </h2>
            <p className='text-gray-500 text-base font-normal font-sans leading-normal'>
              Create an account to start selling or buying
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className='space-y-6'>
            {/* Full Name */}
            <div>
              <label
                htmlFor='fullName'
                className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
              >
                Full Name
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <User className='w-4 h-4 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='fullName'
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange('fullName', e.target.value)
                  }
                  placeholder='Enter your full name'
                  className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                  required
                />
              </div>
              {errors.fullName && (
                <div className='flex items-center gap-2 mt-2'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <span className='text-red-500 text-sm font-normal font-sans'>
                    {errors.fullName}
                  </span>
                </div>
              )}
            </div>

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
                  placeholder='name@example.com'
                  className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
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
                  placeholder='••••••••'
                  className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-12 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                >
                  {showPassword ? (
                    <EyeOff className='w-4 h-4 text-gray-400 hover:text-gray-600' />
                  ) : (
                    <Eye className='w-4 h-4 text-gray-400 hover:text-gray-600' />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className='mt-3'>
                  <div className='w-full h-1 bg-gray-200 rounded-full overflow-hidden'>
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${getStrengthColor()} ${getStrengthWidth()}`}
                    ></div>
                  </div>
                  <div className='flex items-center gap-2 mt-2'>
                    <Check className={`w-3 h-3 ${getStrengthTextColor()}`} />
                    <span
                      className={`text-xs font-normal font-sans leading-none ${getStrengthTextColor()}`}
                    >
                      {getStrengthText()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor='country'
                className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
              >
                Country
              </label>
              <div className='relative'>
                <select
                  id='country'
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className={`w-full bg-white rounded-xl border appearance-none pl-4 pr-10 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 ${
                    errors.country ? 'border-red-500' : 'border-gray-200'
                  }`}
                  required
                >
                  {countries.map((country) => (
                    <option
                      key={country.value}
                      value={country.value}
                      disabled={!country.value}
                    >
                      {country.flag} {country.label}
                    </option>
                  ))}
                </select>
                <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
                  <ChevronDown className='w-4 h-4 text-gray-400' />
                </div>
              </div>
              {errors.country && (
                <div className='flex items-center gap-2 mt-2'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <span className='text-red-500 text-sm font-normal font-sans'>
                    {errors.country}
                  </span>
                </div>
              )}
            </div>

            {/* ZIP Code */}
            <div>
              <label
                htmlFor='zipCode'
                className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
              >
                ZIP Code
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <MapPin className='w-4 h-4 text-gray-400' />
                </div>
                <input
                  type='text'
                  id='zipCode'
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder='Enter your ZIP code'
                  className={`w-full bg-white rounded-xl border pl-10 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400 ${
                    errors.zipCode ? 'border-red-500' : 'border-gray-200'
                  }`}
                  pattern='[0-9]{5}(-[0-9]{4})?'
                  required
                />
              </div>
              {errors.zipCode && (
                <div className='flex items-center gap-2 mt-2'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <span className='text-red-500 text-sm font-normal font-sans'>
                    {errors.zipCode}
                  </span>
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor='phone'
                className='block text-gray-700 text-sm font-normal font-sans leading-tight mb-2'
              >
                Phone
              </label>
              <div className='relative'>
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <Phone className='w-4 h-4 text-gray-400' />
                </div>
                <input
                  type='tel'
                  id='phone'
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder='(123) 456-7890'
                  className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                  required
                />
              </div>
              {errors.phone && (
                <div className='flex items-center gap-2 mt-2'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <span className='text-red-500 text-sm font-normal font-sans'>
                    {errors.phone}
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

            {/* Terms Checkbox */}
            <div className='flex items-start gap-3'>
              <div className='relative mt-1'>
                <input
                  type='checkbox'
                  id='terms'
                  checked={formData.termsAccepted}
                  onChange={(e) =>
                    handleInputChange('termsAccepted', e.target.checked)
                  }
                  className='sr-only'
                  required
                />
                <label
                  htmlFor='terms'
                  className='flex items-center cursor-pointer'
                >
                  <div
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      formData.termsAccepted
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                    }`}
                  >
                    {formData.termsAccepted && (
                      <Check className='w-3 h-3 text-white' />
                    )}
                  </div>
                </label>
              </div>
              <label
                htmlFor='terms'
                className='text-gray-700 text-sm font-normal font-sans leading-tight cursor-pointer'
              >
                I agree to the{' '}
                <Link
                  href='/terms-and-privacy'
                  className='text-green-600 underline hover:text-green-700'
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href='/terms-and-privacy'
                  className='text-green-600 underline hover:text-green-700'
                >
                  Privacy Policy
                </Link>
              </label>
              {errors.terms && (
                <div className='flex items-center gap-2 mt-2'>
                  <AlertCircle className='w-4 h-4 text-red-500' />
                  <span className='text-red-500 text-sm font-normal font-sans'>
                    {errors.terms}
                  </span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={!formData.termsAccepted || isSubmitting}
              className='w-full bg-green-600 text-white text-base font-normal font-sans leading-normal py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center'
            >
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2'></div>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Sign In Link */}
            <div className='text-center pt-4'>
              <span className='text-black text-sm font-normal font-sans leading-tight'>
                Already have an account?{' '}
              </span>
              <Link
                href='/sign-in'
                className='text-green-600 text-sm font-normal font-sans leading-tight hover:text-green-700 transition-colors'
              >
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* SMS Verification Modal */}
      <SmsVerificationModal
        isOpen={showSmsModal}
        onClose={handleCloseModal}
        phoneNumber={formData.phone}
        onVerified={handleSmsVerified}
      />

      {/* Registration Success Modal */}
      <RegistrationSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        onGoToDashboard={handleGoToDashboard}
      />
    </div>
  );
}
