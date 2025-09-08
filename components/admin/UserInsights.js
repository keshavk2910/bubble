export default function UserInsights({ stats, isLoading }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
        User Insights
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Total Users</span>
          <span className="text-gray-900 text-2xl font-bold">
            {isLoading ? '...' : (stats?.totalUsers || 0)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <div className="text-gray-600 text-sm">Service Providers</div>
            <div className="text-gray-600 text-sm">New This Month</div>
          </div>
          <div className="text-right">
            <div className="text-gray-900 text-lg font-semibold">
              {isLoading ? '...' : (stats?.serviceProviders || 0)}
            </div>
            <div className="text-gray-900 text-lg font-semibold">
              {isLoading ? '...' : (stats?.newUsersThisMonth || 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}