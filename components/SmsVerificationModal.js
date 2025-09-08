import { useState, useEffect, useRef } from 'react';
import { Smartphone, X } from 'lucide-react';

export default function SmsVerificationModal({
  isOpen,
  onClose,
  phoneNumber,
  onVerified,
}) {
  const [verificationCode, setVerificationCode] = useState([
    '',
    '',
    '',
    '',
    '',
    '',
  ]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [currentOTP, setCurrentOTP] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-send OTP when modal opens
  useEffect(() => {
    if (isOpen && phoneNumber) {
      handleSendOTP();
    }
  }, [isOpen, phoneNumber]);

  const handleSendOTP = async () => {
    try {
      const session = localStorage.getItem('supabase_session') || localStorage.getItem('temp_session');
      const profile = localStorage.getItem('temp_unverified_profile') || localStorage.getItem('user_profile');
      
      if (!session || !profile) {
        return;
      }

      const sessionData = JSON.parse(session);
      const profileData = JSON.parse(profile);
      const token = sessionData.access_token;

      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profileData.id,
          phone: phoneNumber
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.dev_mode && data.otp) {
          setCurrentOTP(data.otp);
          setIsDevMode(true);
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
    }
  };

  const handleInputChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) return;

    setIsVerifying(true);

    try {
      // For registration flow, we don&apos;t have a session yet - use server-side verification
      const profile = localStorage.getItem('temp_unverified_profile');
      
      if (!profile) {
        alert('Registration session expired. Please register again.');
        return;
      }

      const profileData = JSON.parse(profile);

      // During registration, we don&apos;t have a token yet, so we'll verify directly
      // For post-registration verification, we'll use a different approach

      // Call verify-phone API
      const response = await fetch('/api/verify-phone', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profileData.id,
          otp: code,
          phone: phoneNumber
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onVerified && onVerified();
        setVerificationCode(['', '', '', '', '', '']);
      } else {
        alert(data.details || 'Invalid verification code. Please try again.');
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    setResendCooldown(30); // 30 second cooldown
    setVerificationCode(['', '', '', '', '', '']);
    
    // Send new OTP
    await handleSendOTP();
  };

  const isCodeComplete = verificationCode.every((digit) => digit !== '');

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='w-100 h-113 bg-white rounded-xl border border-gray-200 relative'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Phone Icon */}
        <div className='flex justify-center mt-6 mb-6'>
          <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
            <div className='relative'>
              <div className='w-8 h-8 flex items-center justify-center'>
                <Smartphone className='w-6 h-6 text-gray-600' />
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className='text-center px-6 mb-4'>
          <h2 className='text-gray-700 text-2xl font-normal font-sans leading-loose'>
            One More Step
          </h2>
        </div>

        {/* Subtitle */}
        <div className='text-center px-6 mb-8'>
          <p className='text-gray-500 text-base font-normal font-sans leading-normal'>
            Enter the 6-digit code sent to your phone
          </p>
          {phoneNumber && (
            <p className='text-gray-400 text-sm mt-1'>{phoneNumber}</p>
          )}
          
          {/* Development Mode OTP Display */}
          {isDevMode && currentOTP && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4'>
              <div className='flex items-center justify-center gap-2'>
                <span className='text-blue-700 text-sm font-medium'>
                  Dev Mode - Your code:
                </span>
                <span className='text-blue-900 text-lg font-mono font-bold tracking-wider'>
                  {currentOTP}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 6-Digit Input Fields */}
        <div className='px-6 mb-8'>
          <div className='flex justify-center gap-3'>
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type='text'
                inputMode='numeric'
                pattern='[0-9]'
                value={digit}
                onChange={(e) =>
                  handleInputChange(index, e.target.value.replace(/\D/g, ''))
                }
                onKeyDown={(e) => handleKeyDown(index, e)}
                className='w-12 h-12 rounded-xl border border-gray-300 text-center text-gray-700 text-xl font-normal font-sans leading-7 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600'
                maxLength={1}
              />
            ))}
          </div>
        </div>

        {/* Verify Button */}
        <div className='px-6 mb-6'>
          <button
            onClick={handleVerify}
            disabled={!isCodeComplete || isVerifying}
            className='w-full bg-green-600 text-white text-base font-normal font-sans leading-normal py-3 rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center'
          >
            {isVerifying ? (
              <>
                <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2'></div>
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </button>
        </div>

        {/* Resend Code */}
        <div className='text-center px-6'>
          {resendCooldown > 0 ? (
            <p className='text-gray-400 text-sm font-normal font-sans leading-tight'>
              Resend code in {resendCooldown}s
            </p>
          ) : (
            <button
              onClick={handleResendCode}
              className='text-green-600 text-sm font-normal font-sans leading-tight hover:text-green-700 transition-colors'
            >
              Resend code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
