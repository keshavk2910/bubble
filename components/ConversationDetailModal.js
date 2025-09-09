import { useState, useEffect } from 'react';
import { X, MessageCircle, User, Package, Clock, Phone, Mail } from 'lucide-react';
import Image from 'next/image';

export default function ConversationDetailModal({ isOpen, onClose, conversation }) {
  const [messages, setMessages] = useState([]);
  const [conversationDetails, setConversationDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && conversation?.id) {
      loadConversationDetails();
    }
  }, [isOpen, conversation]);

  const loadConversationDetails = async () => {
    setIsLoading(true);
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/admin/conversations/${conversation.id}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversationDetails(data.conversation);
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error loading conversation details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return 'N/A';
    }
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Conversation Info Sidebar */}
        <div className="w-80 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 text-lg font-semibold font-sans">
                  Conversation Details
                </h3>
                <p className="text-gray-500 text-sm">
                  #{conversation.id.slice(0, 8)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Conversation Info */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Participants */}
            <div>
              <h4 className="text-gray-700 text-sm font-medium font-sans mb-3">
                Participants
              </h4>
              <div className="space-y-3">
                {/* Buyer */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {conversationDetails?.buyer?.full_name || conversation?.buyer?.full_name || 'Unknown Buyer'}
                    </div>
                    <div className="text-xs text-gray-500">Buyer</div>
                  </div>
                </div>

                {/* Seller */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-900">
                      {conversationDetails?.seller?.full_name || conversation?.seller?.full_name || 'Unknown Seller'}
                    </div>
                    <div className="text-xs text-gray-500">Seller</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Listing Info */}
            {(conversationDetails?.listing || conversation?.listing) && (
              <div>
                <h4 className="text-gray-700 text-sm font-medium font-sans mb-3">
                  Related Listing
                </h4>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                      {conversationDetails?.listing?.main_image ? (
                        <Image
                          src={conversationDetails.listing.main_image}
                          alt="Listing"
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 line-clamp-2">
                        {conversationDetails?.listing?.title || conversation?.listing?.title}
                      </div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        ${(conversationDetails?.listing?.price || conversation?.listing?.price)?.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Status: {conversationDetails?.listing?.status || conversation?.listing?.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Conversation Stats */}
            <div>
              <h4 className="text-gray-700 text-sm font-medium font-sans mb-3">
                Statistics
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Messages</span>
                  <span className="text-sm font-medium text-gray-900">
                    {conversation.message_count || messages.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(conversationDetails?.created_at || conversation.created_at)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Last Activity</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(conversationDetails?.last_message_at || conversation.last_message_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-gray-700 text-sm font-medium font-sans mb-3">
                Contact Information
              </h4>
              <div className="space-y-3">
                {/* Buyer Contact */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Buyer</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    {conversationDetails?.buyer?.email || conversation?.buyer?.email || 'N/A'}
                  </div>
                  {(conversationDetails?.buyer?.phone || conversation?.buyer?.phone) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {conversationDetails?.buyer?.phone || conversation?.buyer?.phone}
                    </div>
                  )}
                </div>

                {/* Seller Contact */}
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 uppercase tracking-wide">Seller</div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-3 h-3" />
                    {conversationDetails?.seller?.email || conversation?.seller?.email || 'N/A'}
                  </div>
                  {(conversationDetails?.seller?.phone || conversation?.seller?.phone) && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-3 h-3" />
                      {conversationDetails?.seller?.phone || conversation?.seller?.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Header */}
          <div className="p-6 border-b border-gray-200">
            <h4 className="text-gray-900 text-lg font-semibold font-sans">
              Messages ({messages.length})
            </h4>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No messages in this conversation</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {message.sender?.full_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(message.created_at)}
                        </span>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-3">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {message.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}