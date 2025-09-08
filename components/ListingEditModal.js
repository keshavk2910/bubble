import { useState, useEffect } from 'react';
import { X, Save, Package } from 'lucide-react';

export default function ListingEditModal({ isOpen, onClose, listing, onListingUpdated }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    condition: 'new',
    year: '',
    videoUrl: '',
    price: '',
    zipCode: '',
    status: 'pending'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categoryOptions = [
    { value: 'equipment', label: 'Equipment' },
    { value: 'truck', label: 'Trucks & Vehicles' },
    { value: 'business', label: 'Business' },
    { value: 'parts', label: 'Parts & Accessories' },
  ];

  const conditionOptions = ['new', 'excellent', 'good', 'fair', 'poor'];
  
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'active', label: 'Active' },
    { value: 'sponsored', label: 'Sponsored' },
    { value: 'bubble_binz', label: 'Bubble Binz' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'deleted', label: 'Deleted' },
  ];

  // Initialize form data when listing changes
  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title || '',
        category: listing.category || '',
        description: listing.description || '',
        condition: listing.condition || 'new',
        year: listing.year?.toString() || '',
        videoUrl: listing.video_url || '',
        price: listing.price?.toString() || '',
        zipCode: listing.zip_code || '',
        status: listing.status || 'pending'
      });
    }
  }, [listing]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Title and description are required');
      return;
    }

    if (!formData.price || isNaN(parseFloat(formData.price))) {
      setError('Please provide a valid price');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/admin/listings/${listing.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          condition: formData.condition,
          price: parseFloat(formData.price),
          year: formData.year ? parseInt(formData.year) : null,
          videoUrl: formData.videoUrl.trim() || null,
          zipCode: formData.zipCode.trim(),
          status: formData.status
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onListingUpdated(data.listing);
        onClose();
      } else {
        setError(data.details || data.error || 'Failed to update listing');
      }
    } catch (error) {
      console.error('Update listing error:', error);
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-gray-900 text-xl font-bold font-sans">
                Edit Listing
              </h2>
              <p className="text-gray-500 text-sm font-normal font-sans">
                Update listing information and settings
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter a descriptive title"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                <option value="">Select a category</option>
                {categoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
              placeholder="Provide detailed information about your listing"
              required
            />
          </div>

          {/* Condition, Year, Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Condition */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                Condition *
              </label>
              <select
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                required
              >
                {conditionOptions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                Year
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Year of manufacture"
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>

          {/* ZIP Code and Video URL Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ZIP Code */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                ZIP Code *
              </label>
              <input
                type="text"
                value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="Enter ZIP code"
                required
              />
            </div>

            {/* Video URL */}
            <div>
              <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
                Video URL
              </label>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="YouTube or video URL (optional)"
              />
            </div>
          </div>

          {/* Status (Admin Only) */}
          <div>
            <label className="block text-gray-700 text-sm font-medium font-sans mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-normal font-sans">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Listing
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}