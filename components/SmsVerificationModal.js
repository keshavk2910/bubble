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

    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);

      // Mock verification - in real app, verify with backend
      if (code === '123456') {
        onVerified && onVerified();
        onClose && onClose();
      } else {
        alert('Invalid code. Try 123456 for demo.');
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    }, 1500);
  };

  const handleResendCode = () => {
    if (resendCooldown > 0) return;

    setResendCooldown(30); // 30 second cooldown
    setVerificationCode(['', '', '', '', '', '']);

    // Simulate sending new code
    console.log('Resending SMS code to:', phoneNumber);
    alert('New verification code sent!');
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
