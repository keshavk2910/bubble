import { useState } from 'react';
import Image from 'next/image';
import { DropIcon, CameraIcon } from '../../components/Images/post-new-listing';
import DashboardLayout from '../../components/DashboardLayout';
import Link from 'next/link';
export default function PostNewListing() {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    condition: 'New',
    year: '',
    videoUrl: '',
    price: '',
    zipCode: '',
    images: [],
    termsAccepted: false,
  });

  const [dragOver, setDragOver] = useState(false);

  const conditionOptions = ['New', 'Excellent', 'Good', 'Fair', 'Poor'];
  const categoryOptions = [
    'Equipment',
    'Trucks & Vehicles',
    'Complete Business',
    'Parts & Accessories',
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (files) => {
    // Handle image upload logic here
    const newImages = Array.from(files).map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      isMain: formData.images.length === 0 && index === 0,
    }));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newImages].slice(0, 10),
    }));
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

  const removeImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((img) => img.id !== imageId),
    }));
  };

  const setMainImage = (imageId) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.map((img) => ({
        ...img,
        isMain: img.id === imageId,
      })),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.termsAccepted) {
      alert('Please accept the Terms & Conditions to continue.');
      return;
    }
    console.log('Form submitted:', formData);
    // Handle form submission logic here
  };

  return (
    <DashboardLayout
      title='Post New Listing'
      subtitle='Create a new listing to sell your equipment or business'
    >
      <div className='max-w-5xl mx-auto'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-gray-900 text-4xl font-bold font-sans mb-2'>
            Got Something to Sell?
          </h1>
          <p className='text-gray-600 text-base font-normal font-sans leading-normal'>
            Complete the form below to list your item on Bin Cleaning
            Classifieds
          </p>
        </div>

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
                  placeholder='Enter a descriptive title (e.g. 2020 Pressure Washer - 4000 PSI)'
                  className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor='category'
                  className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                >
                  Category*
                </label>
                <div className='relative'>
                  <select
                    id='category'
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange('category', e.target.value)
                    }
                    className='w-full appearance-none bg-green-600 text-white rounded-lg px-4 py-3 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-700 pr-12'
                    required
                  >
                    <option value='' disabled>
                      Select a category
                    </option>
                    {categoryOptions.map((option) => (
                      <option
                        key={option}
                        value={option.toLowerCase().replace(/ /g, '-')}
                      >
                        {option}
                      </option>
                    ))}
                  </select>
                  <div className='absolute inset-y-0 right-4 flex items-center pointer-events-none'>
                    <svg
                      className='w-4 h-4 text-white'
                      fill='currentColor'
                      viewBox='0 0 20 20'
                    >
                      <path
                        fillRule='evenodd'
                        d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
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
                  onChange={(e) =>
                    handleInputChange('description', e.target.value)
                  }
                  placeholder='Provide detailed information about your listing (condition, features, specifications, etc.)'
                  rows={6}
                  className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400 resize-none'
                  required
                />
              </div>

              {/* Condition */}
              <div className=''>
                <label className='block text-gray-700 text-base font-normal font-sans leading-normal mb-4'>
                  Condition*
                </label>
                <div className='flex gap-3 '>
                  {conditionOptions.map((condition) => (
                    <button
                      key={condition}
                      type='button'
                      onClick={() => handleInputChange('condition', condition)}
                      className={`px-6 py-3 rounded-xl text-base font-normal font-sans leading-normal transition-colors w-full ${
                        formData.condition === condition
                          ? 'bg-gray-900 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {condition}
                    </button>
                  ))}
                </div>
              </div>

              {/* Year and Video URL Row */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* Year */}
                <div className='gap-4 flex flex-col'>
                  <div className=''>
                    <label
                      htmlFor='year'
                      className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                    >
                      Year (if applicable)
                    </label>
                    <input
                      type='text'
                      id='year'
                      value={formData.year}
                      onChange={(e) =>
                        handleInputChange('year', e.target.value)
                      }
                      placeholder='Enter year of manufacture'
                      className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                    />
                  </div>
                  {/* Price */}
                  <div>
                    <label
                      htmlFor='price'
                      className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                    >
                      Price
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
                        placeholder='0.00'
                        className='w-full bg-white rounded-xl border border-gray-200 pl-8 pr-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                        step='0.01'
                        min='0'
                        required
                      />
                    </div>
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <label
                      htmlFor='zipCode'
                      className='block text-gray-700 text-base font-normal font-sans leading-normal mb-2'
                    >
                      ZIP Code
                    </label>
                    <input
                      type='text'
                      id='zipCode'
                      value={formData.zipCode}
                      onChange={(e) =>
                        handleInputChange('zipCode', e.target.value)
                      }
                      placeholder='Enter ZIP code'
                      className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                      pattern='[0-9]{5}(-[0-9]{4})?'
                      required
                    />
                  </div>
                </div>

                {/* Video URL */}
                <div className='gap-4 flex flex-col'>
                  <div className=''>
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
                      onChange={(e) =>
                        handleInputChange('videoUrl', e.target.value)
                      }
                      placeholder='Paste YouTube or Vimeo link'
                      className='w-full bg-white rounded-xl border border-gray-200 px-4 py-3 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 placeholder:text-gray-400'
                    />
                  </div>
                  {formData.videoUrl ? (
                    (() => {
                      // Helper to extract YouTube or Vimeo video ID and platform
                      const getVideoEmbed = (url) => {
                        // YouTube patterns
                        const ytMatch = url.match(
                          /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
                        );
                        if (ytMatch) {
                          return {
                            platform: 'youtube',
                            id: ytMatch[1],
                            embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}`,
                          };
                        }
                        // Vimeo patterns
                        const vimeoMatch = url.match(
                          /vimeo\.com\/(?:video\/)?([0-9]+)/
                        );
                        if (vimeoMatch) {
                          return {
                            platform: 'vimeo',
                            id: vimeoMatch[1],
                            embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
                          };
                        }
                        return null;
                      };

                      const video = getVideoEmbed(formData.videoUrl);

                      if (video) {
                        return (
                          <div className='bg-[#F9F9FB] border-[#E4E6EB] rounded-xl border-[1px] mt-2 h-[200px] flex items-center justify-center overflow-hidden'>
                            <iframe
                              src={video.embedUrl}
                              title='Video Preview'
                              width='100%'
                              height='100%'
                              style={{
                                minHeight: 180,
                                border: 0,
                                borderRadius: '12px',
                              }}
                              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                              allowFullScreen
                            />
                          </div>
                        );
                      } else {
                        return (
                          <div className='text-gray-400 text-sm mt-2 bg-[#F9F9FB] border-[#E4E6EB] rounded-xl border-[1px] mt-2 h-[200px] flex items-center justify-center'>
                            Invalid or unsupported video URL
                          </div>
                        );
                      }
                    })()
                  ) : (
                    <div className='text-gray-400 text-sm mt-2 bg-[#F9F9FB] border-[#E4E6EB] rounded-xl border-[1px] mt-2 h-[200px] flex items-center justify-center'>
                      Video preview will appear here
                    </div>
                  )}
                </div>
              </div>

              {/* Price and ZIP Code Row */}
            </div>
          </section>

          {/* Upload Images Section */}
          <section>
            <h2 className='text-gray-700 text-xl font-normal font-sans leading-7 mb-2'>
              Upload Images
            </h2>
            <p className='text-gray-600 text-base font-normal font-sans leading-normal mb-6'>
              Upload up to 10 high-quality images of your item. First image will
              be used as the main listing photo.
            </p>

            {/* Image Upload Area */}
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
                <div className='mx-auto  flex items-center justify-center'>
                  <Image
                    src={DropIcon.src}
                    alt='Upload icon'
                    width={50}
                    height={50}
                  />
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
                    onClick={() =>
                      document.getElementById('file-upload').click()
                    }
                    className='bg-gray-900 text-white text-base font-normal font-sans px-6 py-3 rounded-md hover:bg-gray-800 transition-colors inline-flex items-center gap-2'
                  >
                    <Image
                      src={CameraIcon.src}
                      alt='Browse files'
                      width={16}
                      height={16}
                    />
                    Browse Files
                  </button>
                </div>
                <p className='text-gray-500 text-sm font-normal font-sans'>
                  Supported formats: JPG, PNG, GIF (Max 5MB each)
                </p>
              </div>

              <input
                id='file-upload'
                type='file'
                multiple
                accept='image/*'
                onChange={(e) => handleImageUpload(e.target.files)}
                className='hidden'
              />
            </div>

            {/* Uploaded Images Preview */}
            {formData.images.length > 0 && (
              <div className='mt-6'>
                <p className='text-gray-700 text-base font-normal font-sans mb-4'>
                  Uploaded Images ({formData.images.length} of 10)
                </p>

                <div className='grid grid-cols-5 gap-4'>
                  {formData.images.map((image, index) => (
                    <div key={image.id} className='relative group'>
                      <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
                        <img
                          src={image.url}
                          alt={`Upload ${index + 1}`}
                          className='w-full h-full object-cover'
                        />
                        {image.isMain && (
                          <div className='absolute top-2 left-2 bg-gray-900 text-white text-xs font-normal font-sans px-2 py-1 rounded'>
                            Main Photo
                          </div>
                        )}
                      </div>

                      {/* Image Controls */}
                      <div className='absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100'>
                        <div className='flex gap-2'>
                          {!image.isMain && (
                            <button
                              type='button'
                              onClick={() => setMainImage(image.id)}
                              className='bg-white text-gray-900 text-xs px-2 py-1 rounded hover:bg-gray-100'
                            >
                              Set Main
                            </button>
                          )}
                          <button
                            type='button'
                            onClick={() => removeImage(image.id)}
                            className='bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700'
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Empty slots */}
                  {Array.from({ length: 10 - formData.images.length }).map(
                    (_, index) => (
                      <div
                        key={`empty-${index}`}
                        className='aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center'
                      >
                        <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center'>
                          <svg
                            className='w-4 h-4 text-gray-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 4v16m8-8H4'
                            />
                          </svg>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Terms & Conditions */}
          <section className='border-t border-gray-200 pt-8 flex justify-between'>
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
                  ></div>
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
                and confirm that my listing complies with all applicable laws
                and regulations.
              </label>
            </div>

            <button
              type='submit'
              className='bg-green-600 text-white text-base font-normal font-sans leading-normal px-8 py-3 rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
              disabled={!formData.termsAccepted}
            >
              Submit My Listing
            </button>
          </section>
        </form>
      </div>
    </DashboardLayout>
  );
}
