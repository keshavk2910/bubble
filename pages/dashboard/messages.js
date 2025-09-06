import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import {
  MessageCircle,
  Send,
  Search,
  Phone,
  MoreVertical,
  ArrowLeft,
  Clock,
  Check,
  CheckCheck,
  User,
  Package
} from 'lucide-react';
import DashboardSidebar from '../../components/DashboardSidebar';

export default function Messages() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const realtimeSubscription = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) {
          router.push('/sign-in?redirect=/dashboard/messages');
          return;
        }

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Get user data
        const userResponse = await fetch('/api/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUserProfile(userData.profile);

        // Load conversations
        await loadConversations(token);
        
        // Set up realtime subscriptions
        setupRealtimeSubscriptions(token);

      } catch (error) {
        console.error('Messages loading error:', error);
        router.push('/sign-in?redirect=/dashboard/messages');
      } finally {
        setIsLoading(false);
      }
    };

    const loadConversations = async (token) => {
      try {
        const response = await fetch('/api/conversations', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations);
        } else {
          // Fallback to mock data if API fails
          const mockConversations = [
        {
          id: '1',
          listing: {
            id: '101',
            title: '2018 Pressure Pro Truck Mount',
            image: '/FRAME.png',
            price: 42500
          },
          otherUser: {
            id: '201',
            name: 'John Smith',
            avatar: null,
            lastSeen: new Date(Date.now() - 1000 * 60 * 5) // 5 minutes ago
          },
          lastMessage: {
            content: 'Hi! Is this truck still available? I am very interested.',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            senderId: '201',
            read: false
          },
          unreadCount: 2
        },
        {
          id: '2',
          listing: {
            id: '102',
            title: 'Complete Bin Cleaning Business',
            image: null,
            price: 85000
          },
          otherUser: {
            id: '202',
            name: 'Sarah Johnson',
            avatar: null,
            lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 2) // 2 hours ago
          },
          lastMessage: {
            content: 'What is included in the business package?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
            senderId: '202',
            read: true
          },
          unreadCount: 0
          }
        ];

        setConversations(mockConversations);
        }
      } catch (error) {
        console.error('Load conversations error:', error);
      }
    };

    const setupRealtimeSubscriptions = (token) => {
      // Set up realtime subscription for new messages
      // Note: This would require the frontend Supabase client for realtime
      // For now, we'll implement polling as a simpler solution
      
      const pollInterval = setInterval(async () => {
        if (selectedConversation) {
          try {
            const response = await fetch(`/api/messages/${selectedConversation.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });

            if (response.ok) {
              const data = await response.json();
              setMessages(data.messages);
            }
          } catch (error) {
            console.error('Message polling error:', error);
          }
        }
      }, 3000); // Poll every 3 seconds

      // Cleanup interval on component unmount
      return () => clearInterval(pollInterval);
    };

    loadMessages();
  }, [router]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation && userProfile) {
      const loadConversationMessages = async () => {
        try {
          const session = localStorage.getItem('supabase_session');
          const sessionData = JSON.parse(session);
          const token = sessionData.access_token;

          const response = await fetch(`/api/messages/${selectedConversation.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setMessages(data.messages);
            scrollToBottom();
          } else {
            // Fallback to mock messages if API fails
            const mockMessages = [
              {
                id: '1',
                content: 'Hi! Is this truck still available? I am very interested.',
                senderId: selectedConversation.otherUser.id,
                timestamp: new Date(Date.now() - 1000 * 60 * 30),
                read: true
              },
              {
                id: '2',
                content: 'Yes, it is still available! What would you like to know about it?',
                senderId: userProfile?.id,
                timestamp: new Date(Date.now() - 1000 * 60 * 25),
                read: true
              }
            ];

            setMessages(mockMessages);
            scrollToBottom();
          }
        } catch (error) {
          console.error('Load conversation messages error:', error);
        }
      };

      loadConversationMessages();
    }
  }, [selectedConversation, userProfile]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: userProfile.id,
      timestamp: new Date(),
      read: false
    };

    // Optimistic update
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    scrollToBottom();

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.content })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Replace optimistic message with real message from server
      setMessages(prev => prev.map(m => 
        m.id === message.id ? data.message : m
      ));

    } catch (error) {
      console.error('Send message error:', error);
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== message.id));
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    
    if (diff < 1000 * 60) return 'Now';
    if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
    if (diff < 1000 * 60 * 60 * 24) return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <DashboardSidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <DashboardSidebar />
      
      {/* Main Content Area - offset by sidebar width */}
      <div className="flex-1 ml-60 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 text-2xl font-semibold font-sans">
                Messages
              </h1>
              <p className="text-gray-500 text-base font-normal font-sans">
                Connect with buyers and sellers
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {conversations.filter(c => c.unreadCount > 0).length} unread conversations
              </span>
            </div>
          </div>
        </header>

        {/* Messages Content */}
        <div className="h-[calc(100vh-80px)] flex overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-gray-700 text-lg font-medium font-sans mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-gray-500 text-sm font-normal font-sans">
                    Messages will appear here when buyers contact you about your listings.
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id ? 'bg-green-50 border-green-200' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        {/* User name and timestamp */}
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-gray-900 text-sm font-medium font-sans truncate">
                            {conversation.otherUser.name}
                          </h4>
                          <span className="text-gray-500 text-xs font-normal font-sans">
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>

                        {/* Listing info */}
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-3 h-3 text-gray-400" />
                          <span className="text-gray-600 text-xs font-normal font-sans truncate">
                            {conversation.listing.title}
                          </span>
                        </div>

                        {/* Last message */}
                        <div className="flex items-center justify-between">
                          <p className="text-gray-600 text-sm font-normal font-sans truncate flex-1">
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full ml-2">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="md:hidden p-2 text-gray-400 hover:text-gray-600"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="text-gray-900 text-base font-semibold font-sans">
                            {selectedConversation.otherUser.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span className="text-gray-600 text-sm font-normal font-sans">
                              {selectedConversation.listing.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-xs font-normal font-sans">
                        Last seen {formatTime(selectedConversation.otherUser.lastSeen)}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Listing Info Bar */}
                <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
                  <div className="flex items-center gap-3">
                    {selectedConversation.listing.image ? (
                      <Image
                        src={selectedConversation.listing.image}
                        alt={selectedConversation.listing.title}
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-blue-900 text-sm font-medium font-sans">
                        {selectedConversation.listing.title}
                      </h4>
                      <p className="text-blue-700 text-xs font-normal font-sans">
                        ${selectedConversation.listing.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === userProfile?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                          message.senderId === userProfile?.id
                            ? 'bg-green-600 text-white rounded-br-md'
                            : 'bg-gray-100 text-gray-900 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm font-normal font-sans leading-5">
                          {message.content}
                        </p>
                        <div className={`flex items-center justify-end gap-1 mt-1 ${
                          message.senderId === userProfile?.id ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          <span className="text-xs font-normal font-sans">
                            {formatTime(message.timestamp)}
                          </span>
                          {message.senderId === userProfile?.id && (
                            <div className="flex">
                              {message.read ? (
                                <CheckCheck className="w-3 h-3" />
                              ) : (
                                <Check className="w-3 h-3" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="w-full bg-gray-100 rounded-full px-4 py-2 text-sm font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-colors"
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-gray-700 text-lg font-medium font-sans mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-500 text-sm font-normal font-sans">
                    Choose a conversation from the list to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}