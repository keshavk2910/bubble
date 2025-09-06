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
} from 'lucide-react';
import SmsVerificationModal from '../components/SmsVerificationModal';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    zipCode: '',
    phone: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number is provided
    if (!formData.phone.trim()) {
      alert('Phone number is required for SMS verification.');
      return;
    }

    setIsRegistering(true);

    // Simulate account creation process
    setTimeout(() => {
      console.log('Registration form submitted:', formData);
      setIsRegistering(false);

      // Open SMS verification modal
      setShowSmsModal(true);
    }, 1000);
  };

  const handleSmsVerified = () => {
    console.log('SMS verification successful!');
    alert('Account created successfully! Welcome to Bin Cleaning Classifieds!');
    // Redirect to dashboard or login page
  };

  const handleCloseModal = () => {
    setShowSmsModal(false);
  };

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center py-12 px-6'>
      <div className='w-full max-w-md'>
        {/* Registration Card */}
        <div className='bg-white rounded-xl border border-gray-200 p-8'>
          {/* Header */}
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
                  className='w-full bg-white rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                  pattern='[0-9]{5}(-[0-9]{4})?'
                  required
                />
              </div>
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
            </div>

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
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={!formData.termsAccepted || isRegistering}
              className='w-full bg-green-600 text-white text-base font-normal font-sans leading-normal py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center'
            >
              {isRegistering ? (
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
    </div>
  );
}
