import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  MessageCircle, 
  Clock,
  Eye
} from 'lucide-react';
import { useOptionalUserSession } from '../../lib/useUserSession';
import AdminLayout from '../../components/AdminLayout';
import ConversationDetailModal from '../../components/ConversationDetailModal';

export default function AdminMessages() {
  const router = useRouter();
  const { user: sessionUser } = useOptionalUserSession();
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Status filter removed - conversations don't have status field
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Load conversations data
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/admin-messages');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Verify admin role
        const userResponse = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          router.push('/sign-in?redirect=/dashboard/admin-messages');
          return;
        }

        const userData = await userResponse.json();
        if (userData.profile?.role !== 'admin') {
          router.replace('/dashboard/user');
          return;
        }

        setUserProfile(userData.profile);

        // Load conversations with filters
        const params = new URLSearchParams();
        params.append('limit', '100');
        if (searchTerm) params.append('search', searchTerm);

        const conversationsResponse = await fetch(`/api/admin/conversations?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (conversationsResponse.ok) {
          const conversationsData = await conversationsResponse.json();
          setConversations(conversationsData.conversations);
        }

      } catch (error) {
        console.error('Admin messages loading error:', error);
        router.push('/sign-in?redirect=/dashboard/admin-messages');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [router, searchTerm]);

  const handleViewConversation = (conversation) => {
    setSelectedConversation(conversation);
    setShowDetailModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  // Status functionality removed - conversations don't have status field

  const handleExport = () => {
    console.log('Exporting conversations...');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Messages Monitoring - Bin Cleaning Classifieds</title>
        <meta name="description" content="Monitor all platform conversations and messages" />
      </Head>
      
      <AdminLayout
        currentPage="admin-messages"
        title="Messages Monitoring"
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onExport={handleExport}
        showAnalytics={true}
      >
        {/* Messages Management */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-gray-900 text-lg font-semibold font-sans">
                All Platform Conversations
              </h2>
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-500">
                  Real-time conversation monitoring
                </div>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-gray-500 text-sm">
                Total: {conversations.length} conversations
              </p>
            </div>
          </div>
          
          {/* Conversations Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-3 text-gray-600 text-sm font-normal font-sans">
                    Conversation
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 text-sm font-normal font-sans">
                    Participants
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 text-sm font-normal font-sans">
                    Listing
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 text-sm font-normal font-sans">
                    Messages
                  </th>
                  <th className="text-left px-6 py-3 text-gray-600 text-sm font-normal font-sans">
                    Last Activity
                  </th>
                  <th className="text-center px-6 py-3 text-gray-600 text-sm font-normal font-sans">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {conversations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="text-gray-500 text-base font-normal font-sans">
                        No conversations found
                      </div>
                    </td>
                  </tr>
                ) : (
                  conversations.map((conversation) => (
                    <tr key={conversation.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              Conv #{conversation.id.slice(0, 8)}
                            </div>
                            <div className="text-xs text-gray-500 max-w-xs truncate">
                              {conversation.last_message_preview}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900">
                            👤 {conversation.buyer?.full_name || 'Unknown Buyer'}
                          </div>
                          <div className="text-sm text-gray-900">
                            🏪 {conversation.seller?.full_name || 'Unknown Seller'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                            {conversation.listing?.title || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ${conversation.listing?.price?.toLocaleString() || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">
                            {conversation.message_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {formatDate(conversation.last_message_at)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewConversation(conversation)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View conversation details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
              Showing 1-{Math.min(50, conversations.length)} of {conversations.length} conversations
            </p>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">
                Previous
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-green-600 text-white text-sm">
                1
              </button>
              <button className="px-3 py-1 text-sm text-gray-500 hover:bg-gray-50 rounded transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Conversation Detail Modal */}
        <ConversationDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedConversation(null);
          }}
          conversation={selectedConversation}
        />
      </AdminLayout>
    </>
  );
}