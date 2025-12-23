import { MoreHorizontal, Edit, Ban, CheckCircle, Eye, Mail, Phone } from 'lucide-react';

export default function UsersTable({ 
  users = [], 
  isLoading = false, 
  onEdit, 
  onBlock, 
  onView, 
  hideCheckboxes = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 10,
  totalItems = 0
}) {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'blocked': return 'bg-red-100 text-red-700';
      case 'inactive': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading users...</p>
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
              {!hideCheckboxes && (
                <th className="w-4 px-4 py-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
              )}
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Name</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Email</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Phone</th>
              <th className="text-center px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Verification</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Joined</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Type</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Listings</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={hideCheckboxes ? "9" : "10"} className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-base font-normal font-sans">
                    No users found
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || index} className="hover:bg-gray-50 transition-colors">
                  {!hideCheckboxes && (
                    <td className="px-4 py-3">
                      <input type="checkbox" className="rounded border-gray-300" />
                    </td>
                  )}
                  <td className="px-4 py-3 text-gray-700 text-sm font-normal font-sans leading-tight">
                    <div>
                      <div className="font-medium">{user.full_name || 'N/A'}</div>
                      {user.display_name && user.display_name !== user.full_name && (
                        <div className="text-xs text-gray-500">@{user.display_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {user.phone || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {/* Email Verification Status */}
                      <div className="relative group">
                        <Mail 
                          className={`w-4 h-4 ${
                            user.email_verified === true 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          }`}
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Email {user.email_verified === true ? 'Verified' : 'Not Verified'}
                        </div>
                      </div>
                      
                      {/* Phone Verification Status */}
                      <div className="relative group">
                        <Phone 
                          className={`w-4 h-4 ${
                            user.phone_verified === true 
                              ? 'text-green-600' 
                              : 'text-gray-400'
                          }`}
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          Phone {user.phone_verified === true ? 'Verified' : 'Not Verified'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {formatDate(user.registration_date || user.created_at)}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    <span className="capitalize">{user.user_type || 'customer'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
                      <span className="capitalize">{user.status || 'active'}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {user.listing_count || 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button 
                          onClick={() => onEdit(user)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit user"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {onView && (
                        <button 
                          onClick={() => onView(user)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View user details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onBlock && (
                        <button 
                          onClick={() => onBlock(user)}
                          className={`p-1 transition-colors ${
                            user.status === 'blocked' 
                              ? 'text-gray-400 hover:text-green-600' 
                              : 'text-gray-400 hover:text-red-600'
                          }`}
                          title={user.status === 'blocked' ? 'Unblock user' : 'Block user'}
                        >
                          {user.status === 'blocked' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} users
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onPageChange && onPageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => onPageChange && onPageChange(pageNum)}
                  className={`w-8 h-8 flex items-center justify-center rounded text-sm transition-colors ${
                    pageNum === currentPage
                      ? 'bg-green-600 text-white'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              onClick={() => onPageChange && onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}