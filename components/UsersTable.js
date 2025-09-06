import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';

export default function UsersTable({ users = [], isLoading = false, onEdit, onDelete, onView }) {
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      case 'new': return 'bg-blue-100 text-blue-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
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
              <th className="w-4 px-4 py-3">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Username</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Email</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Registration Date</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Status</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Listings</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-base font-normal font-sans">
                    No users found
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user, index) => (
                <tr key={user.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 text-gray-700 text-sm font-normal font-sans leading-tight">
                    {user.username}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {user.registrationDate}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {user.listings}
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
                      {onDelete && (
                        <button 
                          onClick={() => onDelete(user)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {onView && (
                        <button 
                          onClick={() => onView(user)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View user"
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
          Showing 1-{Math.min(8, users.length)} of {users.length} users
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