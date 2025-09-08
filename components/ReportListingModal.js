import { useState } from 'react';
import { X, Flag, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ReportListingModal({ isOpen, onClose, listingTitle, listingId }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReported, setIsReported] = useState(false);

  const predefinedReasons = [
    {
      id: 'inappropriate',
      label: 'Inappropriate Content',
      description: 'Contains offensive, discriminatory, or inappropriate material'
    },
    {
      id: 'spam',
      label: 'Spam or Duplicate',
      description: 'This appears to be spam or a duplicate listing'
    },
    {
      id: 'misleading',
      label: 'Misleading Information',
      description: 'The listing contains false or misleading information'
    },
    {
      id: 'pricing',
      label: 'Suspicious Pricing',
      description: 'The price seems unrealistic or potentially fraudulent'
    },
    {
      id: 'prohibited',
      label: 'Prohibited Item',
      description: 'This item is not allowed on our marketplace'
    },
    {
      id: 'scam',
      label: 'Potential Scam',
      description: 'This listing appears to be fraudulent or a scam'
    },
    {
      id: 'other',
      label: 'Other',
      description: 'Please describe the issue in detail below'
    }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedReason) {
      alert('Please select a reason for reporting this listing.');
      return;
    }

    if (selectedReason === 'other' && !customReason.trim()) {
      alert('Please provide additional details for your report.');
      return;
    }

    setIsSubmitting(true);

    // Mock API call - will be replaced with real API later
    setTimeout(() => {
      console.log('Report submitted:', {
        listingId,
        reason: selectedReason,
        customReason: customReason,
        timestamp: new Date().toISOString()
      });
      
      setIsSubmitting(false);
      setIsReported(true);
      
      // Auto-close after showing success message
      setTimeout(() => {
        handleClose();
      }, 3000);
    }, 1000);
  };

  const handleClose = () => {
    setSelectedReason('');
    setCustomReason('');
    setIsSubmitting(false);
    setIsReported(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-gray-900 text-xl font-semibold font-sans">
                Report Listing
              </h2>
              <p className="text-gray-500 text-sm font-normal font-sans">
                Help us maintain a safe marketplace
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Success State */}
        {isReported ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-green-800 text-2xl font-semibold font-sans mb-4">
              Report Submitted Successfully
            </h3>
            <p className="text-green-700 text-base font-normal font-sans mb-4">
              Thank you for reporting this listing. Our admin team will review your report and take appropriate action.
            </p>
            <p className="text-green-600 text-sm font-normal font-sans mb-6">
              We appreciate your help in keeping Bubble Binz Classifieds clean and safe for everyone.
            </p>
            <button
              onClick={handleClose}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          /* Report Form */
          <form onSubmit={handleSubmit} className="p-6">
            {/* Listing Info */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <h3 className="text-gray-900 text-base font-semibold font-sans mb-2">
                Reporting Listing:
              </h3>
              <p className="text-gray-700 text-sm font-normal font-sans truncate">
                {listingTitle}
              </p>
            </div>

            {/* Warning Notice */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-amber-800 text-sm font-semibold font-sans mb-1">
                    Important Notice
                  </h4>
                  <p className="text-amber-700 text-sm font-normal font-sans">
                    False reports may result in account restrictions. Please only report listings that genuinely violate our community guidelines.
                  </p>
                </div>
              </div>
            </div>

            {/* Reason Selection */}
            <div className="mb-6">
              <h3 className="text-gray-900 text-base font-semibold font-sans mb-4">
                Why are you reporting this listing?
              </h3>
              <div className="space-y-3">
                {predefinedReasons.map((reason) => (
                  <label
                    key={reason.id}
                    className={`block p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                      selectedReason === reason.id
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="reason"
                        value={reason.id}
                        checked={selectedReason === reason.id}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                      />
                      <div>
                        <div className="text-gray-900 text-sm font-semibold font-sans">
                          {reason.label}
                        </div>
                        <div className="text-gray-600 text-sm font-normal font-sans">
                          {reason.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Reason Textarea */}
            {selectedReason === 'other' && (
              <div className="mb-6">
                <label htmlFor="customReason" className="block text-gray-900 text-base font-semibold font-sans mb-3">
                  Please describe the issue:
                </label>
                <textarea
                  id="customReason"
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Please provide specific details about why you&apos;re reporting this listing..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-700 text-sm font-normal font-sans focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  required
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedReason || isSubmitting}
                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-2"></div>
                    Submitting Report...
                  </>
                ) : (
                  <>
                    <Flag className="w-4 h-4 mr-2" />
                    Submit Report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}