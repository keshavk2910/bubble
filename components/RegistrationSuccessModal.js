import { useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

export default function RegistrationSuccessModal({
  isOpen,
  onClose,
  onGoToDashboard,
}) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50'>
      <div className='w-96 relative bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden'>
        {/* Close Button */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors'
        >
          <X className='w-5 h-5' />
        </button>

        {/* Modal Content */}
        <div className='w-full h-80 px-8 py-8 flex flex-col items-center'>
          {/* Success Icon */}
          <div className='w-16 h-16 mb-6 flex items-center justify-center'>
            <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-10 h-10 text-white' />
            </div>
          </div>

          {/* Welcome Message */}
          <div className='text-center mb-8'>
            <h2 className='text-gray-700 text-3xl font-normal font-sans leading-9 mb-4'>
              Welcome!
            </h2>
            <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
              Thanks for signing up.
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onGoToDashboard}
            className='py-3 px-4 w-full bg-green-600 text-white text-base font-normal font-sans leading-normal rounded-xl hover:bg-green-700 transition-colors'
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
