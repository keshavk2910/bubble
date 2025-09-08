import { useState } from 'react';
import Image from 'next/image';
import { MoreHorizontal, Edit, Trash2, Eye, CheckCircle, XCircle, RotateCcw, ChevronDown, Package } from 'lucide-react';

export default function ListingsTable({ listings = [], isLoading = false, onEdit, onDelete, onView, onStatusChange, onApprove, onReject, onRecover }) {
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, listing: null });
  const [recoverConfirm, setRecoverConfirm] = useState({ show: false, listing: null });
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'sponsored': return 'bg-blue-100 text-blue-700';
      case 'bubble binz': return 'bg-purple-100 text-purple-700';
      case 'bubble_binz': return 'bg-purple-100 text-purple-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      case 'deleted': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'equipment': '🔧',
      'trucks-vehicles': '🚗', 
      'complete-business': '🏢',
      'parts-accessories': '🔧',
    };
    return icons[category] || '📦';
  };

  const formatCategoryDisplay = (category) => {
    const categoryMap = {
      'equipment': 'Equipment',
      'trucks-vehicles': 'Trucks & Vehicles',
      'complete-business': 'Complete Business', 
      'parts-accessories': 'Parts & Accessories'
    };
    return categoryMap[category] || category;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-4 px-4 py-3">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">ID</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Title</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Category</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">User</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Date</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Status</th>
              <th className="text-right px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {listings.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-base font-normal font-sans">
                    No listings found
                  </div>
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {listing.main_image ? (
                          <Image
                            src={listing.main_image}
                            alt={listing.title}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <a 
                          href={`/listing/${listing.slug || listing.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 text-sm font-medium font-sans truncate hover:text-green-600 transition-colors block"
                        >
                          {listing.title} ({listing.display_id || `BZ-${listing.listing_id}`})
                        </a>
                        <p className="text-gray-500 text-xs font-normal font-sans truncate">
                          ${listing.price?.toLocaleString()} • {listing.condition}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-sm">
                      <span className="text-lg">
                        {getCategoryIcon(listing.category)}
                      </span>
                      <span className="text-gray-700 font-normal font-sans">
                        {formatCategoryDisplay(listing.category)}
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {listing.seller_name || listing.user}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {formatDate(listing.created_at || listing.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Status Dropdown */}
                      <div className="relative">
                        <select
                          value={listing.status}
                          onChange={(e) => onStatusChange && onStatusChange(listing.id, e.target.value)}
                          className={`appearance-none border rounded-full px-3 py-1 pr-8 text-xs font-medium cursor-pointer focus:outline-none ${getStatusColor(listing.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="active">Active</option>
                          <option value="sponsored">Sponsored</option>
                          <option value="bubble_binz">Bubble Binz</option>
                          <option value="inactive">Inactive</option>
                          <option value="deleted">Deleted</option>
                        </select>
                        <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                          <ChevronDown className="w-3 h-3 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick approve/reject for pending listings */}
                      {listing.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onApprove && onApprove(listing)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Approve listing"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onReject && onReject(listing)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Reject listing"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      {onView && (
                        <a
                          href={`/listing/${listing.slug || listing.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View listing"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      )}
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(listing)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {listing.status === 'deleted' ? (
                        <button
                          onClick={() => setRecoverConfirm({ show: true, listing })}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          title="Recover listing"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        onDelete && (
                          <button 
                            onClick={() => setDeleteConfirm({ show: true, listing })}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )
                      )}
                      {onView && (
                        <button 
                          onClick={() => onView(listing)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View listing"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing 1-{Math.min(8, listings.length)} of {listings.length} listings
        </p>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">
            Previous
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded bg-green-600 text-white text-sm">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-50 text-sm transition-colors">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:bg-gray-50 text-sm transition-colors">
            3
          </button>
          <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">
            Next
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-gray-900 text-lg font-semibold font-sans mb-2">
                Delete Listing
              </h3>
              <p className="text-gray-600 text-base font-normal font-sans mb-2">
                Are you sure you want to delete &quot;{deleteConfirm.listing?.title}&quot;?
              </p>
              <p className="text-gray-500 text-sm font-normal font-sans">
                This will hide the listing from users. You can recover it later if needed.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({ show: false, listing: null })}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete && onDelete(deleteConfirm.listing);
                  setDeleteConfirm({ show: false, listing: null });
                }}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recover Confirmation Modal */}
      {recoverConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RotateCcw className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-gray-900 text-lg font-semibold font-sans mb-2">
                Recover Listing
              </h3>
              <p className="text-gray-600 text-base font-normal font-sans mb-2">
                Are you sure you want to recover &quot;{recoverConfirm.listing?.title}&quot;?
              </p>
              <p className="text-orange-600 text-sm font-medium font-sans">
                This will make the listing visible on the website again.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setRecoverConfirm({ show: false, listing: null })}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onRecover && onRecover(recoverConfirm.listing);
                  setRecoverConfirm({ show: false, listing: null });
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              >
                Recover Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}