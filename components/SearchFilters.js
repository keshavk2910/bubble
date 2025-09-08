import { useState, useEffect } from 'react';

export default function SearchFilters({ onFilterChange, activeFilters = {} }) {
  const [searchTerm, setSearchTerm] = useState(activeFilters.search || '');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    setSearchTerm(activeFilters.search || '');
  }, [activeFilters.search]);

  const categories = [
    { value: '', label: 'Category' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'truck', label: 'Trucks' },
    { value: 'business', label: 'Business' },
  ];

  const priceRanges = [
    { value: '', label: 'Price Range' },
    { value: '0-1000', label: 'Under $1,000' },
    { value: '1000-10000', label: '$1,000 - $10,000' },
    { value: '10000-50000', label: '$10,000 - $50,000' },
    { value: '50000+', label: '$50,000+' },
  ];

  const conditions = [
    { value: '', label: 'Condition' },
    { value: 'new', label: 'New' },
    { value: 'used-excellent', label: 'Used - Excellent' },
    { value: 'used-good', label: 'Used - Good' },
    { value: 'used-fair', label: 'Used - Fair' },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'distance', label: 'Distance' },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onFilterChange) {
      onFilterChange({ ...activeFilters, search: searchTerm });
    }
  };

  const handleFilterChange = (filterType, value) => {
    if (onFilterChange) {
      onFilterChange({ ...activeFilters, [filterType]: value });
    }
  };

  const removeFilter = (filterType) => {
    if (onFilterChange) {
      const newFilters = { ...activeFilters };
      delete newFilters[filterType];
      onFilterChange(newFilters);
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => key !== 'search' && activeFilters[key] && activeFilters[key] !== ''
  );

  const getDisplayValue = (filterType, value) => {
    switch (filterType) {
      case 'category':
        return categories.find((c) => c.value === value)?.label || 'Category';
      case 'priceRange':
        return (
          priceRanges.find((r) => r.value === value)?.label || 'Price Range'
        );
      case 'condition':
        return conditions.find((c) => c.value === value)?.label || 'Condition';
      case 'sort':
        return `Sort: ${
          sortOptions.find((s) => s.value === value)?.label || 'Newest First'
        }`;
      default:
        return value || 'ZIP + Radius';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Search Bar */}
      <div className='bg-white'>
        <form onSubmit={handleSearchSubmit} className='relative'>
          <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
            <svg
              className='w-5 h-5 text-gray-400'
              fill='currentColor'
              viewBox='0 0 20 20'
            >
              <path
                fillRule='evenodd'
                d='M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z'
                clipRule='evenodd'
              />
            </svg>
          </div>
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder='Search listings...'
            className='w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-gray-200 text-gray-400 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent'
          />
        </form>
      </div>

      {/* Filter Controls Container */}
      <div className='bg-white rounded-lg shadow-lg p-6'>
        {/* Desktop Filters Row */}
        <div className='hidden md:flex flex-wrap items-center gap-3 mb-4'>
          {/* Category Dropdown */}
          <div className='relative'>
            <select
              value={activeFilters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className='appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 pr-8 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 min-w-32'
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
              <svg
                className='w-3 h-3 text-gray-700'
                fill='currentColor'
                viewBox='0 0 12 12'
              >
                <path d='M6 8.5L2.5 4.5h7L6 8.5z' />
              </svg>
            </div>
          </div>

          {/* Price Range Dropdown */}
          <div className='relative'>
            <select
              value={activeFilters.priceRange || ''}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className='appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 pr-8 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 min-w-36'
            >
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
              <svg
                className='w-3 h-3 text-gray-700'
                fill='currentColor'
                viewBox='0 0 12 12'
              >
                <path d='M6 8.5L2.5 4.5h7L6 8.5z' />
              </svg>
            </div>
          </div>

          {/* ZIP + Radius Input */}
          <div className='relative'>
            <input
              type='text'
              placeholder='ZIP + Radius'
              value={activeFilters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className='bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 min-w-36 placeholder:text-gray-700'
            />
          </div>

          {/* Condition Dropdown */}
          <div className='relative'>
            <select
              value={activeFilters.condition || ''}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className='appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 pr-8 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 min-w-32'
            >
              {conditions.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
              <svg
                className='w-3 h-3 text-gray-700'
                fill='currentColor'
                viewBox='0 0 12 12'
              >
                <path d='M6 8.5L2.5 4.5h7L6 8.5z' />
              </svg>
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className='relative'>
            <select
              value={activeFilters.sort || 'newest'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className='appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 pr-8 text-gray-700 text-base font-normal font-sans leading-normal focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 min-w-48'
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort: {option.label}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 right-3 flex items-center pointer-events-none'>
              <svg
                className='w-3 h-3 text-gray-700'
                fill='currentColor'
                viewBox='0 0 12 12'
              >
                <path d='M6 8.5L2.5 4.5h7L6 8.5z' />
              </svg>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className='md:hidden w-full bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans flex items-center justify-between'
        >
          <span>Filters</span>
          <div className='flex items-center gap-2'>
            {hasActiveFilters && (
              <span className='bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center'>
                {
                  Object.keys(activeFilters).filter(
                    (key) => key !== 'search' && activeFilters[key]
                  ).length
                }
              </span>
            )}
            <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 12 12'>
              <path d='M6 8.5L2.5 4.5h7L6 8.5z' />
            </svg>
          </div>
        </button>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className='flex flex-wrap gap-2 mt-4'>
            {activeFilters.category && (
              <span className='inline-flex items-center gap-1 bg-green-600/10 text-green-600 text-sm font-normal font-sans leading-tight px-3 py-1 rounded-full'>
                Category:{' '}
                {
                  categories.find((c) => c.value === activeFilters.category)
                    ?.label
                }
                <button
                  onClick={() => removeFilter('category')}
                  className='ml-1 hover:bg-green-600/20 rounded-full p-0.5'
                >
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 12 12'
                  >
                    <path d='M6 4.586L8.293 2.293a1 1 0 111.414 1.414L7.414 6l2.293 2.293a1 1 0 01-1.414 1.414L6 7.414 3.707 9.707a1 1 0 01-1.414-1.414L4.586 6 2.293 3.707a1 1 0 011.414-1.414L6 4.586z' />
                  </svg>
                </button>
              </span>
            )}

            {activeFilters.priceRange && (
              <span className='inline-flex items-center gap-1 bg-green-600/10 text-green-600 text-sm font-normal font-sans leading-tight px-3 py-1 rounded-full'>
                Price:{' '}
                {
                  priceRanges.find((r) => r.value === activeFilters.priceRange)
                    ?.label
                }
                <button
                  onClick={() => removeFilter('priceRange')}
                  className='ml-1 hover:bg-green-600/20 rounded-full p-0.5'
                >
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 12 12'
                  >
                    <path d='M6 4.586L8.293 2.293a1 1 0 111.414 1.414L7.414 6l2.293 2.293a1 1 0 01-1.414 1.414L6 7.414 3.707 9.707a1 1 0 01-1.414-1.414L4.586 6 2.293 3.707a1 1 0 011.414-1.414L6 4.586z' />
                  </svg>
                </button>
              </span>
            )}

            {activeFilters.location && (
              <span className='inline-flex items-center gap-1 bg-green-600/10 text-green-600 text-sm font-normal font-sans leading-tight px-3 py-1 rounded-full'>
                ZIP: {activeFilters.location} (25 miles)
                <button
                  onClick={() => removeFilter('location')}
                  className='ml-1 hover:bg-green-600/20 rounded-full p-0.5'
                >
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 12 12'
                  >
                    <path d='M6 4.586L8.293 2.293a1 1 0 111.414 1.414L7.414 6l2.293 2.293a1 1 0 01-1.414 1.414L6 7.414 3.707 9.707a1 1 0 01-1.414-1.414L4.586 6 2.293 3.707a1 1 0 011.414-1.414L6 4.586z' />
                  </svg>
                </button>
              </span>
            )}

            {activeFilters.condition && (
              <span className='inline-flex items-center gap-1 bg-green-600/10 text-green-600 text-sm font-normal font-sans leading-tight px-3 py-1 rounded-full'>
                Condition:{' '}
                {
                  conditions.find((c) => c.value === activeFilters.condition)
                    ?.label
                }
                <button
                  onClick={() => removeFilter('condition')}
                  className='ml-1 hover:bg-green-600/20 rounded-full p-0.5'
                >
                  <svg
                    className='w-3 h-3 text-green-600'
                    fill='currentColor'
                    viewBox='0 0 12 12'
                  >
                    <path d='M6 4.586L8.293 2.293a1 1 0 111.414 1.414L7.414 6l2.293 2.293a1 1 0 01-1.414 1.414L6 7.414 3.707 9.707a1 1 0 01-1.414-1.414L4.586 6 2.293 3.707a1 1 0 011.414-1.414L6 4.586z' />
                  </svg>
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Mobile Filters Panel */}
      {showMobileFilters && (
        <div className='md:hidden bg-white border border-gray-200 rounded-lg p-4 space-y-4'>
          <select
            value={activeFilters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className='w-full appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans'
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>

          <select
            value={activeFilters.priceRange || ''}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className='w-full appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans'
          >
            {priceRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>

          <input
            type='text'
            placeholder='ZIP + Radius'
            value={activeFilters.location || ''}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className='w-full bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans placeholder:text-gray-700'
          />

          <select
            value={activeFilters.condition || ''}
            onChange={(e) => handleFilterChange('condition', e.target.value)}
            className='w-full appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans'
          >
            {conditions.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>

          <select
            value={activeFilters.sort || 'newest'}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className='w-full appearance-none bg-white border border-green-600/10 rounded-xl px-4 py-2 text-gray-700 text-base font-normal font-sans'
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Sort: {option.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
