import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  Save,
  AlertCircle,
  ChevronDown,
  Wrench,
  Truck,
  Building2,
  Settings,
} from 'lucide-react';
import Link from 'next/link';

export default function ListingForm({
  initialData = null,
  isEdit = false,
  listingId = null,
  onSubmitSuccess,
}) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    condition: initialData?.condition || 'new',
    year: initialData?.year || '',
    yearEstablished: initialData?.year_established || '',
    videoUrl: initialData?.video_url || '',
    price: initialData?.price?.toString() || '',
    zipCode: initialData?.zip_code || '',
    city: initialData?.city || '',
    termsAccepted: !isEdit, // For edit, terms are already accepted
  });

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const conditionOptions = ['new', 'excellent', 'good', 'fair', 'poor'];
  const categoryOptions = [
    { value: 'equipment', label: 'Equipment', icon: Wrench },
    { value: 'truck', label: 'Trucks & Vehicles', icon: Truck },
    { value: 'business', label: 'Business', icon: Building2 },
    { value: 'parts', label: 'Parts & Accessories', icon: Settings },
  ];

  // Load existing images for edit mode
  useEffect(() => {
    if (isEdit && initialData?.listing_images) {
      const sortedImages = initialData.listing_images
        .sort((a, b) => a.display_order - b.display_order)
        .map((img) => ({
          id: img.id,
          url: img.image_url,
          isMain: img.is_main,
          displayOrder: img.display_order,
          isExisting: true,
        }));
      setExistingImages(sortedImages);
    }
  }, [isEdit, initialData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Get category-specific placeholders
  const getPlaceholders = () => {
    switch (formData.category) {
      case 'business':
        return {
          title: 'e.g., Established Bin Cleaning Business - Turnkey Operation',
          description: 'Describe the business (services offered, customer base, revenue, equipment included, reason for selling, etc.)',
          price: 'Contact for pricing',
          city: 'e.g., Phoenix',
          yearEstablished: 'e.g., 2015',
        };
      case 'equipment':
        return {
          title: 'e.g., Honda Pressure Washer 3000 PSI',
          description: 'Provide detailed information (condition, features, specifications, hours used, maintenance history, etc.)',
          price: '0.00',
          city: 'e.g., Phoenix',
          year: 'e.g., 2020',
        };
      case 'truck':
        return {
          title: 'e.g., 2015 Ford F-150 Service Truck',
          description: 'Provide detailed information (condition, mileage, features, modifications, service history, etc.)',
          price: '0.00',
          city: 'e.g., Phoenix',
          year: 'e.g., 2015',
        };
      case 'parts':
        return {
          title: 'e.g., Replacement Nozzles and Spray Tips Set',
          description: 'Provide detailed information (condition, compatibility, brand, quantity, specifications, etc.)',
          price: '0.00',
          city: 'e.g., Phoenix',
          year: '',
        };
      default:
        return {
          title: 'Enter a descriptive title',
          description: 'Provide detailed information about your listing',
          price: '0.00',
          city: 'Enter city',
          year: '',
          yearEstablished: '',
        };
    }
  };

  const placeholders = getPlaceholders();

  const handleImageUpload = (files) => {
    const totalImages = existingImages.length + newImages.length;
    const maxNewImages = 10 - totalImages;
    const filesArray = Array.from(files).slice(0, maxNewImages);

    // Validate file types - only allow specific image formats
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    const invalidFiles = filesArray.filter(file => !allowedTypes.includes(file.type.toLowerCase()));

    if (invalidFiles.length > 0) {
      alert(`Unsupported file format detected. Please upload only JPG, PNG, WEBP, or GIF images.\n\nNote: Apple HEIC/HEIF formats are not supported. Please convert to JPG or PNG first.`);
      return;
    }

    // Validate file size - max 20MB per image
    const maxSize = 20 * 1024 * 1024; // 20MB
    const oversizedFiles = filesArray.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      const fileNames = oversizedFiles.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`).join('\n');
      alert(`Some files are too large. Maximum size is 20MB per image.\n\nOversized files:\n${fileNames}\n\nPlease compress or resize these images and try again.`);
      return;
    }

    const filesToUpload = filesArray.filter(file => allowedTypes.includes(file.type.toLowerCase()));

    const newImageFiles = filesToUpload.map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      isMain: totalImages === 0 && index === 0,
      isExisting: false,
    }));

    setNewImages((prev) => [...prev, ...newImageFiles]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDragStart = (start) => {
    setIsDragging(true);
  };

  const handleDragEnd = (result) => {
    setIsDragging(false);

    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    const destinationDroppableId = result.destination.droppableId;

    if (sourceIndex === destinationIndex && destinationDroppableId === 'images')
      return;

    // Handle drag to delete zone
    if (destinationDroppableId === 'delete-zone') {
      const allImages = [...existingImages, ...newImages];
      const imageToDelete = allImages[sourceIndex];

      if (imageToDelete.isExisting) {
        removeExistingImage(imageToDelete.id);
      } else {
        removeNewImage(imageToDelete.id);
      }
      return;
    }

    // Handle normal reordering
    const allImages = [...existingImages, ...newImages];
    const [movedImage] = allImages.splice(sourceIndex, 1);
    allImages.splice(destinationIndex, 0, movedImage);

    // Update display_order and main image logic
    const reorderedImages = allImages.map((img, index) => ({
      ...img,
      displayOrder: index,
      isMain: index === 0, // First image becomes main automatically
    }));

    // Separate back into existing and new images
    const updatedExistingImages = reorderedImages.filter(
      (img) => img.isExisting
    );
    const updatedNewImages = reorderedImages.filter((img) => !img.isExisting);

    setExistingImages(updatedExistingImages);
    setNewImages(updatedNewImages);

    // Save image order for existing images in edit mode
    if (isEdit && updatedExistingImages.length > 0) {
      saveImageOrder();
    }
  };

  const removeExistingImage = async (imageId) => {
    if (!isEdit) return;

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/listing-images/${listingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageId }),
      });

      if (response.ok) {
        setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      }
    } catch (error) {
      console.error('Delete image error:', error);
    }
  };

  const removeNewImage = (imageId) => {
    setNewImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const saveImageOrder = async () => {
    if (!isEdit) return;

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      await fetch(`/api/listing-images/${listingId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ images: existingImages }),
      });
    } catch (error) {
      console.error('Save image order error:', error);
    }
  };

  const uploadNewImage = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const session = localStorage.getItem('supabase_session');
          const sessionData = JSON.parse(session);
          const token = sessionData.access_token;

          const response = await fetch('/api/upload-image', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image: e.target.result,
              fileName: file.name,
              contentType: file.type,
            }),
          });

          if (!response.ok) {
            throw new Error('Image upload failed');
          }

          const data = await response.json();
          resolve(data.image.url);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEdit && !formData.termsAccepted) {
      setSubmitError('Please accept the Terms & Conditions to continue.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const session = localStorage.getItem('supabase_session');
      if (!session) {
        setSubmitError('Please sign in to create a listing.');
        return;
      }

      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      // Upload new images first
      const uploadedImages = [];
      if (newImages.length > 0) {
        setIsUploadingImages(true);
        setUploadProgress({ current: 0, total: newImages.length });

        for (let i = 0; i < newImages.length; i++) {
          const imageData = newImages[i];
          setUploadProgress({ current: i + 1, total: newImages.length });

          try {
            const url = await uploadNewImage(imageData.file);

            if (isEdit) {
              // For edit mode, add to database immediately
              const imageResponse = await fetch(
                `/api/listing-images/${listingId}`,
                {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    imageUrl: url,
                    isMain: imageData.isMain,
                    displayOrder: existingImages.length + uploadedImages.length,
                  }),
                }
              );

              if (imageResponse.ok) {
                const imageData = await imageResponse.json();
                uploadedImages.push(imageData.image);
              }
            } else {
              // For create mode, collect URLs for bulk creation
              uploadedImages.push({
                url,
                isMain: imageData.isMain,
              });
            }
          } catch (error) {
            console.error('Image upload error:', error);
            setIsUploadingImages(false);
            setUploadProgress({ current: 0, total: 0 });
            setSubmitError('Failed to upload some images. Please try again.');
            setIsSubmitting(false);
            return;
          }
        }

        setIsUploadingImages(false);
        setUploadProgress({ current: 0, total: 0 });
      }

      // Save image order for edit mode
      if (isEdit && existingImages.length > 0) {
        await saveImageOrder();
      }

      // Prepare listing data
      const listingData = {
        title: formData.title,
        description: formData.description,
        category: formData.category, // Already in database format (equipment, truck, business, parts)
        // Only include condition if not business category
        ...(formData.category !== 'business' ? { condition: formData.condition.toLowerCase() } : {}),
        price: formData.price,
        year: formData.year,
        // Include yearEstablished only for business category
        ...(formData.category === 'business' ? { yearEstablished: formData.yearEstablished } : {}),
        videoUrl: formData.videoUrl,
        city: formData.city,
        zipCode: formData.zipCode,
        ...(isEdit ? {} : { images: uploadedImages }),
      };

      // Submit to appropriate endpoint
      const url = isEdit
        ? `/api/listings?listingId=${listingId}`
        : '/api/listings';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(
          data.details ||
            data.error ||
            `Failed to ${isEdit ? 'update' : 'create'} listing`
        );
        return;
      }

      // Call success callback
      if (onSubmitSuccess) {
        onSubmitSuccess(data);
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitError(
        'Network error. Please check your connection and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
    <form
      onSubmit={handleSubmit}
      className='bg-white rounded-xl border border-gray-200 p-8 space-y-8'
    >
      {/* Listing Details Section */}
      <section>
        <h2 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-6'>
          Listing Details
        </h2>

        <div className='space-y-6'>
          {/* Listing Title */}
          <div>
            <label
              htmlFor='title'
              className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
            >
              Listing Title*
            </label>
            <input
              type='text'
              id='title'
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder={placeholders.title}
              className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className='block text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
              Category*
            </label>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              {categoryOptions.map((option) => {
                const Icon = option.icon;
                const isSelected = formData.category === option.value;

                return (
                  <button
                    key={option.value}
                    type='button'
                    onClick={() => handleInputChange('category', option.value)}
                    className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                      isSelected
                        ? 'border-green-600 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-3 rounded-lg ${
                      isSelected ? 'bg-green-600' : 'bg-gray-100'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        isSelected ? 'text-white' : 'text-gray-600'
                      }`} />
                    </div>
                    <span className={`text-sm font-medium font-sans text-center ${
                      isSelected ? 'text-green-600' : 'text-gray-700'
                    }`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor='description'
              className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
            >
              Description*
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder={placeholders.description}
              rows={6}
              className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 resize-none placeholder:text-gray-400'
              required
            />
          </div>

          {/* Condition - Hidden for Business category */}
          {formData.category !== 'business' && (
            <div>
              <label className='block text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                Condition*
              </label>
              <div className='flex flex-wrap gap-3'>
                {conditionOptions.map((condition) => (
                  <button
                    key={condition}
                    type='button'
                    onClick={() => handleInputChange('condition', condition)}
                    className={`px-6 py-3 rounded-xl text-base font-normal font-sans leading-normal transition-colors ${
                      formData.condition === condition
                        ? 'bg-gray-900 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {condition.charAt(0).toUpperCase() + condition.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Year Established - Only for Business category */}
          {formData.category === 'business' && (
            <div>
              <label
                htmlFor='yearEstablished'
                className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
              >
                Year Established (Optional)
              </label>
              <input
                type='text'
                id='yearEstablished'
                value={formData.yearEstablished}
                onChange={(e) => handleInputChange('yearEstablished', e.target.value)}
                placeholder={placeholders.yearEstablished || 'e.g., 2015'}
                className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-gray-400'
              />
            </div>
          )}

          {/* Year and Video URL Row */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='gap-1 grid  grid-cols-1'>
              {formData.category !== 'business' && (
                <div className=''>
                  <label
                    htmlFor='year'
                    className='block text-gray-700 text-base font-normal font-sans leading-normal '
                  >
                    Year (if applicable)
                  </label>
                  <input
                    type='text'
                    id='year'
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', e.target.value)}
                    placeholder={placeholders.year || 'Enter year'}
                    className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-gray-400'
                  />
                </div>
              )}
              <div className=''>
                <div>
                  <label
                    htmlFor='price'
                    className='block text-gray-700 text-base font-normal font-sans leading-normal '
                  >
                    {formData.category === 'business' ? 'Asking Price (Optional)' : 'Price*'}
                  </label>
                  <div className='relative'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <span className='text-gray-500 text-base'>$</span>
                    </div>
                    <input
                      type='number'
                      id='price'
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange('price', e.target.value)
                      }
                      placeholder={placeholders.price}
                      className='w-full bg-white rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-gray-400'
                      step='0.01'
                      min='0'
                      required={formData.category !== 'business'}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor='City'
                  className='block text-gray-700 text-base font-normal font-sans leading-normal '
                >
                  City
                </label>
                <input
                  type='text'
                  id='city'
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={placeholders.city || 'Enter city'}
                  className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-gray-400'
                  required
                />
              </div>
              <div>
                <label
                  htmlFor='zipCode'
                  className='block text-gray-700 text-base font-normal font-sans leading-normal '
                >
                  ZIP Code (Optional)
                </label>
                <input
                  type='text'
                  id='zipCode'
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange('zipCode', e.target.value)}
                  placeholder='Enter ZIP code'
                  className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-gray-400'
                  pattern='[0-9]{5}(-[0-9]{4})?'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='videoUrl'
                className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
              >
                Video (Optional)
              </label>
              <input
                type='url'
                id='videoUrl'
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                placeholder='Paste YouTube or Vimeo link'
                className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 placeholder:text-gray-400'
              />
              <div className='mt-2 w-full aspect-video relative'>
                {formData.videoUrl ? (
                  (() => {
                    // Helper to extract embed URL for YouTube or Vimeo
                    const getEmbedUrl = (url) => {
                      // YouTube patterns
                      const ytMatch = url.match(
                        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
                      );
                      if (ytMatch) {
                        return `https://www.youtube.com/embed/${ytMatch[1]}`;
                      }
                      // Vimeo patterns
                      const vimeoMatch = url.match(
                        /vimeo\.com\/(?:video\/)?([0-9]+)/
                      );
                      if (vimeoMatch) {
                        return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
                      }
                      return null;
                    };

                    const embedUrl = getEmbedUrl(formData.videoUrl);

                    if (embedUrl) {
                      return (
                        <iframe
                          src={embedUrl}
                          title='Video Preview'
                          className='w-full h-full absolute top-0 left-0 rounded-lg border border-gray-200'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                          allowFullScreen
                        />
                      );
                    } else {
                      return (
                        <div className='w-full h-full absolute top-0 left-0 flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-md'>
                          <p className='text-gray-400 text-sm text-center px-2'>
                            Enter a valid YouTube or Vimeo link to preview the
                            video.
                          </p>
                        </div>
                      );
                    }
                  })()
                ) : (
                  <div className='w-full h-full absolute top-0 left-0 flex items-center justify-center bg-gray-100 border-2 border-gray-200 rounded-md'>
                    <p className='text-gray-400 text-sm text-center px-2'>
                      Enter a valid YouTube or Vimeo link to preview the video.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price and ZIP Code Row */}
        </div>
      </section>

      {/* Upload Images Section */}
      <section>
        <h2 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-2'>
          {isEdit ? 'Manage Images' : 'Upload Images'}
        </h2>
        <p className='text-gray-600 text-base font-normal font-sans leading-normal mb-6'>
          Upload up to 10 high-quality images.{' '}
          {isEdit
            ? 'Drag to reorder.'
            : 'First image will be used as the main listing photo.'}
        </p>

        {/* Image Management */}
        {(existingImages.length > 0 || newImages.length > 0) && (
          <div className='mb-6'>
            <p className='text-gray-700 text-base font-normal font-sans mb-4'>
              Images ({existingImages.length + newImages.length} of 10)
            </p>

            <DragDropContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onBeforeCapture={() => setIsDragging(true)}
            >
              {/* Full-width Delete Zone (appears only when dragging) */}
              {isDragging && (
                <div className='mb-6'>
                  <Droppable droppableId='delete-zone'>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-300 transform ${
                          snapshot.isDraggingOver
                            ? 'border-red-500 bg-red-100 scale-105 shadow-lg'
                            : 'border-red-300 bg-red-50 animate-pulse'
                        }`}
                      >
                        <div className='flex items-center gap-3'>
                          <Trash2
                            className={`w-6 h-6 ${
                              snapshot.isDraggingOver
                                ? 'text-red-600'
                                : 'text-red-500'
                            }`}
                          />
                          <span
                            className={`text-base font-medium ${
                              snapshot.isDraggingOver
                                ? 'text-red-600'
                                : 'text-red-500'
                            }`}
                          >
                            Drop image here to delete
                          </span>
                        </div>
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )}

              <Droppable droppableId='images' direction='horizontal'>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`grid grid-cols-5 gap-4 ${
                      snapshot.isDraggingOver
                        ? 'bg-green-50 rounded-lg p-2'
                        : ''
                    }`}
                  >
                    {/* All Images (existing + new) */}
                    {[...existingImages, ...newImages].map((image, index) => (
                      <Draggable
                        key={image.id}
                        draggableId={image.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`relative cursor-move ${
                              snapshot.isDragging ? 'z-40' : ''
                            }`}
                          >
                            <div
                              className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                                snapshot.isDragging
                                  ? 'shadow-xl transform rotate-2 border-green-500'
                                  : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              {image.isExisting ? (
                                <Image
                                  src={image.url}
                                  alt='Listing image'
                                  width={200}
                                  height={200}
                                  className='w-full h-full object-cover pointer-events-none'
                                />
                              ) : (
                                <Image
                                  src={image.url}
                                  alt='New upload'
                                  fill
                                  className='object-cover pointer-events-none'
                                />
                              )}

                              {/* Main Image Badge */}
                              {image.isMain && (
                                <div className='absolute top-2 left-2 bg-green-600 text-white text-xs font-normal font-sans px-2 py-1 rounded flex items-center gap-1'>
                                  <Star className='w-3 h-3' />
                                  Main
                                </div>
                              )}

                              {/* Position Indicator */}
                              <div className='absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded'>
                                {index + 1}
                              </div>

                              {/* Drag Indicator */}
                              <div className='absolute top-2 right-2 bg-white/90 rounded-full p-1'>
                                <GripVertical className='w-4 h-4 text-gray-700' />
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* Empty slots */}
                    {Array.from({
                      length: 10 - (existingImages.length + newImages.length),
                    }).map((_, index) => (
                      <button
                        key={`empty-${index}`}
                        type='button'
                        onClick={() => document.getElementById('file-upload').click()}
                        className='aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-green-600 hover:bg-green-50 transition-all cursor-pointer group'
                        title='Click to upload images'
                      >
                        <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-all'>
                          <div className='text-gray-400 text-3xl font-thin group-hover:text-white transition-all'>
                            +
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        {/* Image Upload Area */}
        {existingImages.length + newImages.length < 10 && (
          <div
            className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragOver
                ? 'border-green-600 bg-green-50'
                : 'border-gray-300 bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className='space-y-4'>
              <div className='w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center'>
                <Upload className='w-8 h-8 text-gray-400' />
              </div>
              <div>
                <p className='text-gray-700 text-lg font-normal font-sans mb-2'>
                  Drag & Drop Images Here
                </p>
                <p className='text-gray-500 text-base font-normal font-sans mb-4'>
                  or
                </p>
                <button
                  type='button'
                  onClick={() => document.getElementById('file-upload').click()}
                  className='bg-gray-900 text-white text-base font-normal font-sans px-6 py-3 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center gap-2'
                >
                  <Upload className='w-4 h-4' />
                  Browse Files
                </button>
              </div>
              <p className='text-gray-500 text-sm font-normal font-sans'>
                Supported formats: JPG, PNG, WEBP, GIF (Max 20MB each)
              </p>
              <p className='text-gray-400 text-xs font-normal font-sans mt-1'>
                Note: Apple HEIC/HEIF formats not supported
              </p>
            </div>

            <input
              id='file-upload'
              type='file'
              multiple
              accept='image/jpeg,image/jpg,image/png,image/webp,image/gif'
              onChange={(e) => handleImageUpload(e.target.files)}
              className='hidden'
            />
          </div>
        )}
      </section>

      {/* Terms & Conditions (only for create mode) */}
      {!isEdit && (
        <section className='border-t border-gray-200 pt-8'>
          <div className='flex items-start gap-3 mb-6'>
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
                  className={`w-4 h-4 rounded border-2 transition-colors ${
                    formData.termsAccepted
                      ? 'bg-green-600 border-green-600'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  {formData.termsAccepted && (
                    <svg
                      className='w-3 h-3 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                        clipRule='evenodd'
                      />
                    </svg>
                  )}
                </div>
              </label>
            </div>
            <label
              htmlFor='terms'
              className='text-gray-700 text-base font-normal font-sans leading-normal cursor-pointer'
            >
              I agree to the{' '}
              <Link
                href='/terms-and-privacy'
                className='text-green-600 underline'
              >
                Terms & Conditions
              </Link>{' '}
              and confirm that my listing complies with all applicable laws and
              regulations.
            </label>
          </div>
        </section>
      )}

      {/* Error Message */}
      {submitError && (
        <div className='bg-red-50 border border-red-200 rounded-xl p-4'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='w-5 h-5 text-red-500' />
            <span className='text-red-700 text-sm font-normal font-sans'>
              {submitError}
            </span>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className='flex justify-between pt-6 border-t border-gray-200'>
        {isEdit && (
          <button
            type='button'
            onClick={() => router.push('/dashboard/user')}
            className='bg-gray-100 text-gray-700 px-8 py-3 rounded-md hover:bg-gray-200 transition-colors'
          >
            Cancel
          </button>
        )}

        <button
          type='submit'
          className={`bg-green-600 text-white text-base font-normal font-sans leading-normal px-8 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 ${
            !isEdit ? 'w-full' : ''
          }`}
          disabled={(!isEdit && !formData.termsAccepted) || isSubmitting}
        >
          <div className='m-auto flex items-center gap-2'>
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin'></div>
                {isEdit ? 'Updating Listing...' : 'Submitting Listing...'}
              </>
            ) : (
              <>
                <Save className='w-4 h-4' />
                {isEdit ? 'Update Listing' : 'Submit My Listing'}
              </>
            )}
          </div>
        </button>
      </div>
    </form>

    {/* Image Upload Progress Modal */}
    {isUploadingImages && (
      <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
        <div className='bg-white rounded-xl p-8 shadow-2xl max-w-md w-full mx-4'>
          <div className='flex flex-col items-center gap-4'>
            <div className='w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin'></div>
            <div className='text-center'>
              <h3 className='text-gray-900 text-lg font-semibold font-sans mb-2'>
                Uploading Images...
              </h3>
              <p className='text-gray-600 text-base font-normal font-sans mb-3'>
                Image {uploadProgress.current} of {uploadProgress.total}
              </p>
              {/* Progress Bar */}
              <div className='w-full bg-gray-200 rounded-full h-2.5 mb-2'>
                <div
                  className='bg-green-600 h-2.5 rounded-full transition-all duration-300'
                  style={{
                    width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                  }}
                ></div>
              </div>
              <p className='text-gray-500 text-sm font-normal font-sans'>
                Please wait, do not close this page.
              </p>
            </div>
          </div>
        </div>
      </div>
    )}
  </>
  );
}
