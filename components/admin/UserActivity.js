export default function UserActivity({ data, isLoading }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
        User Activity (This Month)
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">New Listings</span>
          <span className="text-gray-900 text-lg font-semibold">
            {isLoading ? '...' : (data?.newListingsPosted || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Active Sellers</span>
          <span className="text-gray-900 text-lg font-semibold">
            {isLoading ? '...' : (data?.uniqueListingUsers || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Messages Sent</span>
          <span className="text-gray-900 text-lg font-semibold">
            {isLoading ? '...' : (data?.totalMessages || 0)}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Active Messagers</span>
          <span className="text-gray-900 text-lg font-semibold">
            {isLoading ? '...' : (data?.uniqueMessageUsers || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}