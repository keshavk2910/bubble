import { useState, useEffect } from 'react';
import ListingCard from '../components/ListingCard';
import SearchFilters from '../components/SearchFilters';
import {
  mockListings,
  filterListings,
  sortListings,
} from '../data/mockListings';
import Layout from '@/components/Layout';
export default function BrowseListings() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    priceRange: '',
    location: '',
    condition: '',
    sort: 'newest',
  });

  const [filteredListings, setFilteredListings] = useState(mockListings);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Update filtered listings when filters change
  useEffect(() => {
    let filtered = filterListings(mockListings, filters);
    filtered = sortListings(filtered, filters.sort);
    setFilteredListings(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, endIndex);

  const Pagination = () => {
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    pages.push(
      <button
        key='prev'
        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-base font-normal font-sans leading-normal transition-colors ${
          currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        &lt;
      </button>
    );

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-normal font-sans leading-normal transition-colors ${
            i === currentPage
              ? 'bg-gray-900 text-white'
              : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    pages.push(
      <button
        key='next'
        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-base font-normal font-sans leading-normal transition-colors ${
          currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-50'
        }`}
      >
        &gt;
      </button>
    );

    return (
      <div className='flex items-center justify-center gap-3 mt-12'>
        {pages}
      </div>
    );
  };

  return (
    <Layout>
      <div className='max-w-7xl mx-auto px-6 py-8'>
        {/* Page Header */}
        <div className='mb-8'>
          <h1 className='text-gray-900 text-4xl font-medium font-sans leading-10 mb-4'>
            Find What You Need – Fast
          </h1>
        </div>

        {/* Search and Filters */}
        <div className='mb-8'>
          <SearchFilters
            onFilterChange={handleFilterChange}
            activeFilters={filters}
          />
        </div>

        {/* Results Count */}
        <div className='mb-6'>
          <p className='text-gray-700 text-base font-normal font-sans leading-normal'>
            Showing {filteredListings.length} result
            {filteredListings.length !== 1 ? 's' : ''}
            {filters.search && <span> for &ldquo;{filters.search}&rdquo;</span>}
          </p>
        </div>

        {/* Listings Grid */}
        {currentListings.length > 0 ? (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8'>
              {currentListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && <Pagination />}
          </>
        ) : (
          <div className='text-center py-16'>
            <div className='w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center'>
              <svg
                className='w-12 h-12 text-gray-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <h3 className='text-xl font-medium text-gray-900 mb-2'>
              No listings found
            </h3>
            <p className='text-gray-600 mb-6'>
              Try adjusting your search criteria or clearing some filters.
            </p>
            <button
              onClick={() =>
                setFilters({
                  search: '',
                  category: '',
                  priceRange: '',
                  location: '',
                  condition: '',
                  sort: 'newest',
                })
              }
              className='bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition-colors'
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
