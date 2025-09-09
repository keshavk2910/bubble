import { useState } from 'react';
import { Eye, CheckCircle, X, Flag, User, ExternalLink } from 'lucide-react';

export default function ReportsTable({ 
  reports = [], 
  isLoading = false, 
  onViewListing, 
  onViewReporter, 
  onResolve, 
  onDismiss,
  onChangeListingStatus 
}) {
  const [selectedReport, setSelectedReport] = useState(null);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'dismissed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getReasonLabel = (reason) => {
    const reasonMap = {
      'inappropriate': 'Inappropriate Content',
      'spam': 'Spam/Duplicate',
      'misleading': 'Misleading Info',
      'pricing': 'Suspicious Pricing',
      'prohibited': 'Prohibited Item',
      'scam': 'Potential Scam',
      'other': 'Other'
    };
    return reasonMap[reason] || reason;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading reports...</p>
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
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Report ID</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Listing</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Reason</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Reporter</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Date</th>
              <th className="text-left px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Status</th>
              <th className="text-right px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-12 text-center">
                  <div className="text-gray-500 text-base font-normal font-sans">
                    No reports found
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-300" />
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    #{report.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={`/listing/${report.listing?.slug || report.listing?.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-700 text-sm font-medium font-sans hover:text-green-600 transition-colors flex items-center gap-1"
                      >
                        {report.listing?.title || 'Unknown Listing'}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-gray-500 text-xs">
                      {report.listing?.display_id || 'N/A'} • {report.listing?.status}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-gray-700 text-sm font-medium font-sans">
                        {getReasonLabel(report.reason)}
                      </span>
                      {report.custom_reason && (
                        <p className="text-gray-500 text-xs mt-1 truncate max-w-xs">
                          {report.custom_reason}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onViewReporter && onViewReporter(report)}
                        className="text-gray-700 text-sm font-medium font-sans hover:text-blue-600 transition-colors flex items-center gap-1"
                      >
                        <User className="w-3 h-3" />
                        {report.reporter?.full_name || 'Anonymous'}
                      </button>
                    </div>
                    <p className="text-gray-500 text-xs">{report.reporter_email}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm font-normal font-sans leading-tight">
                    {formatDate(report.created_at)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      <div className="w-1.5 h-1.5 bg-current rounded-full mr-1"></div>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Quick listing status toggle */}
                      {report.listing?.status === 'active' ? (
                        <button
                          onClick={() => onChangeListingStatus && onChangeListingStatus(report.listing, 'pending')}
                          className="p-1 text-orange-600 hover:text-orange-700 transition-colors"
                          title="Suspend listing (make pending)"
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      ) : report.listing?.status === 'pending' ? (
                        <button
                          onClick={() => onChangeListingStatus && onChangeListingStatus(report.listing, 'active')}
                          className="p-1 text-green-600 hover:text-green-700 transition-colors"
                          title="Approve listing (make active)"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      ) : null}

                      {/* Report actions */}
                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => onResolve && onResolve(report)}
                            className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            title="Mark as resolved"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDismiss && onDismiss(report)}
                            className="p-1 text-red-600 hover:text-red-700 transition-colors"
                            title="Dismiss report"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => onViewListing && onViewListing(report.listing)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="View listing"
                      >
                        <Eye className="w-4 h-4" />
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
          Showing 1-{Math.min(10, reports.length)} of {reports.length} reports
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
          <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}