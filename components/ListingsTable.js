import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

export default function ListingsTable({ listings = [], isLoading = false, onEdit, onDelete, onView }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'sponsored': return 'bg-blue-100 text-blue-700';
      case 'bubble binz': return 'bg-purple-100 text-purple-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Actions</th>
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
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {listing.id}
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-normal font-sans leading-tight">
                    {listing.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {listing.category}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {listing.user}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {listing.date}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
                      {listing.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(listing)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit listing"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(listing)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
    </div>
  );
}