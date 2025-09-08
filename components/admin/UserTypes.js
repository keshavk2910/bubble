export default function UserTypes({ data, isLoading }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
        User Types
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700 text-sm">Service Providers</span>
          </div>
          <span className="text-gray-900 text-sm font-semibold">
            {isLoading ? '...' : (data?.service_provider || 0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700 text-sm">Customers</span>
          </div>
          <span className="text-gray-900 text-sm font-semibold">
            {isLoading ? '...' : (data?.customer || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}