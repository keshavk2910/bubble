export default function NewRegistrations({ data, isLoading }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
        New Registrations
      </h3>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : data?.monthlyRegistrations ? (
          data.monthlyRegistrations.slice(-6).map((month, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-600 text-xs">{month.month}</span>
              <div className="flex items-center gap-2">
                <div 
                  className="bg-green-500 rounded h-2"
                  style={{ 
                    width: `${Math.max(month.registrations * 10, 10)}px`,
                    maxWidth: '80px'
                  }}
                ></div>
                <span className="text-gray-900 text-sm font-medium w-8 text-right">
                  {month.registrations}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500 text-sm">
            No registration data available
          </div>
        )}
      </div>
    </div>
  );
}