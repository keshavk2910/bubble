export default function GeographicDistribution({ data, isLoading }) {
  const defaultData = [
    { country: 'United States', users: 45 },
    { country: 'Canada', users: 25 },
    { country: 'United Kingdom', users: 15 },
    { country: 'Australia', users: 10 },
    { country: 'Other', users: 5 }
  ];

  const displayData = data?.geographicDistribution || defaultData;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-gray-900 text-lg font-semibold font-sans mb-4">
        Geographic Distribution
      </h3>
      
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          displayData.slice(0, 5).map((location, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700 text-sm">{location.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="bg-blue-500 rounded h-2"
                  style={{ 
                    width: `${Math.max(location.users * 5, 10)}px`,
                    maxWidth: '60px'
                  }}
                ></div>
                <span className="text-gray-900 text-sm font-medium w-8 text-right">
                  {location.users}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}