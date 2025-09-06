import { useState } from 'react';
import { X, Mail, Send, CheckCircle, AlertCircle } from 'lucide-react';

export default function EmailVerificationModal({ isOpen, onClose, email, onVerified }) {
  const [step, setStep] = useState('send'); // 'send' or 'verify'
  const [otpCode, setOtpCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [sentOTP, setSentOTP] = useState('');

  const handleSendOTP = async () => {
    setIsSending(true);
    setError('');

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/verify-email', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSentOTP(data.otp); // Store for demo purposes
        setStep('verify');
      } else {
        const errorData = await response.json();
        setError(errorData.details || 'Failed to send verification email');
      }
    } catch (error) {
      console.error('Send email verification error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/verify-email', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp: otpCode }),
      });

      if (response.ok) {
        onVerified();
        handleClose();
      } else {
        const errorData = await response.json();
        setError(errorData.details || 'Invalid verification code');
      }
    } catch (error) {
      console.error('Verify email OTP error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setStep('send');
    setOtpCode('');
    setError('');
    setSentOTP('');
    onClose();
  };

  const handleOtpChange = (value) => {
    // Only allow digits and max 6 characters
    const cleanValue = value.replace(/\D/g, '').slice(0, 6);
    setOtpCode(cleanValue);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900 text-xl font-bold font-sans">
                Email Verification
              </h2>
              <p className="text-gray-500 text-sm font-normal font-sans">
                Verify your email address
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'send' ? (
          // Step 1: Send verification email
          <div>
            <div className="mb-6">
              <p className="text-gray-700 text-base font-normal font-sans mb-4">
                We'll send a 6-digit verification code to your email address:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <span className="text-gray-900 text-base font-medium font-sans">
                  {email}
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm font-normal font-sans">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendOTP}
                disabled={isSending}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Code
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          // Step 2: Enter verification code
          <div>
            <div className="mb-6">
              <p className="text-gray-700 text-base font-normal font-sans mb-4">
                Enter the 6-digit code sent to:
              </p>
              <div className="bg-gray-50 rounded-lg p-3 text-center mb-4">
                <span className="text-gray-900 text-base font-medium font-sans">
                  {email}
                </span>
              </div>

              {/* Demo OTP Display */}
              {sentOTP && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="text-blue-700 text-sm font-normal font-sans">
                      Demo Code: {sentOTP}
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="otp" className="block text-gray-700 text-sm font-medium font-sans mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otpCode}
                  onChange={(e) => handleOtpChange(e.target.value)}
                  placeholder="000000"
                  className="w-full text-center text-2xl font-mono tracking-widest bg-white border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                  maxLength={6}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-700 text-sm font-normal font-sans">
                    {error}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('send')}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-md hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleVerifyOTP}
                disabled={isVerifying || otpCode.length !== 6}
                className="flex-1 bg-green-600 text-white px-4 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 flex items-center justify-center gap-2"
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verify Email
                  </>
                )}
              </button>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={handleSendOTP}
                className="text-blue-600 text-sm hover:text-blue-700 transition-colors"
              >
                Didn't receive the code? Resend
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}