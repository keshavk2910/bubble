import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabaseClient } from '../../lib/supabase';
import { useOptionalUserSession } from '../../lib/useUserSession';
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
  Package,
  Image as ImageIcon,
  Paperclip,
  Smile,
  X,
} from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import DashboardSidebar from '../../components/DashboardSidebar';

export default function Messages() {
  const router = useRouter();
  const { user: sessionUser, avatar: sessionAvatar } = useOptionalUserSession();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loadingConversationId, setLoadingConversationId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const messagesEndRef = useRef(null);
  const realtimeChannelRef = useRef(null);
  const selectedConversationRef = useRef(null);
  const userProfileRef = useRef(null);

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
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user data');
        }

        const userData = await userResponse.json();
        setUserProfile(userData.profile);
        userProfileRef.current = userData.profile;

        // Update user presence when opening chat
        await updateUserPresence(token);

        // Load conversations
        await loadConversations(token);

        // Set up realtime subscriptions with user session
        setupRealtimeSubscriptions(sessionData);

        // Check if we need to open a specific conversation (from Contact Seller)
        const { conversation: conversationId } = router.query;
        if (conversationId) {
          // We'll check for the conversation after realtime is set up
          setTimeout(() => {
            setConversations((prev) => {
              const conversation = prev.find((c) => c.id === conversationId);
              if (conversation) {
                setSelectedConversation(conversation);
                selectedConversationRef.current = conversation;
              }
              return prev;
            });
          }, 1000);
        }
      } catch (error) {
        console.error('Messages loading error:', error);
        router.push('/sign-in?redirect=/dashboard/messages');
      } finally {
        setIsLoading(false);
      }
    };

    const updateUserPresence = async (token) => {
      try {
        await fetch('/api/user/update-presence', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('✅ User presence updated');
      } catch (error) {
        console.error('Failed to update presence:', error);
      }
    };

    const loadConversations = async (token) => {
      try {
        const response = await fetch('/api/conversations', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations);
        } else {
          console.error('Failed to load conversations');
          setConversations([]);
        }
      } catch (error) {
        console.error('Load conversations error:', error);
      }
    };

    const setupRealtimeSubscriptions = async (sessionData) => {
      try {
        console.log(
          '🔄 Setting up realtime subscriptions for user:',
          userProfileRef.current?.id
        );
        console.log('📊 Supabase client config:', {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
          anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
            ? 'Present'
            : 'Missing',
        });

        // Set the user's JWT token for realtime auth
        const { data, error } = await supabaseClient.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });

        if (error) {
          console.error('❌ Failed to set session:', error);
          return () => {};
        }

        console.log('✅ User session set for realtime:', data.user?.id);

        // Create a unique channel for this user's messages
        const channelName = `user-messages-${userProfileRef.current?.id}`;
        console.log('📡 Creating realtime channel:', channelName);

        const channel = supabaseClient.channel(
          `conversation-${selectedConversationRef.current?.id}`,
          {
            config: {
              broadcast: { self: false },
            },
          }
        );

        console.log('🎧 Setting up broadcast listener for messages');

        // Listen for broadcast messages (better for chat)
        channel
          .on('broadcast', { event: 'new_message' }, (payload) => {
            console.log('📨 New message received via broadcast:', payload);

            const { message, conversationId, senderId } = payload.payload;

            // Only process if it&apos;s not from current user
            if (senderId !== userProfileRef.current?.id) {
              console.log('✅ Message is from another user - processing');

              // Add to messages if it&apos;s for the selected conversation
              if (selectedConversationRef.current?.id === conversationId) {
                console.log(
                  '✅ Message is for current conversation - adding to UI'
                );

                setMessages((prev) => {
                  const newMessages = [...prev, message];
                  console.log(
                    '📝 Adding message to conversation. Total messages:',
                    newMessages.length
                  );
                  return newMessages;
                });

                setTimeout(() => {
                  console.log('📍 Auto-scrolling to new message');
                  scrollToBottom();
                  playNotificationSound();
                }, 100);
              }

              // Update conversation list
              setConversations((prev) => {
                const updatedConversations = prev.map((conv) => {
                  if (conv.id === conversationId) {
                    return {
                      ...conv,
                      lastMessage: message,
                      unreadCount: (conv.unreadCount || 0) + 1,
                      lastMessageAt: message.timestamp,
                    };
                  }
                  return conv;
                });
                console.log('📋 Updated conversations with new message');
                return updatedConversations;
              });
            } else {
              console.log(
                '🚫 Message is from current user - ignoring broadcast event'
              );
            }
          })
          .subscribe((status) => {
            console.log('📡 Realtime subscription status:', status);
            if (status === 'SUBSCRIBED') {
              console.log('✅ Successfully subscribed to realtime messages');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Realtime subscription error');
            }
          });

        // Store channel reference for cleanup
        realtimeChannelRef.current = channel;

        // Return cleanup function
        return () => {
          console.log('🧹 Cleaning up realtime subscriptions');
          if (realtimeChannelRef.current) {
            realtimeChannelRef.current.unsubscribe();
            realtimeChannelRef.current = null;
          }
        };
      } catch (error) {
        console.error('Realtime setup error:', error);
        return () => {}; // Return empty cleanup function on error
      }
    };

    // Notification sound function
    const playNotificationSound = () => {
      try {
        // Create audio element for notification sound
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.5;
        audio
          .play()
          .catch((e) => console.log('Could not play notification sound:', e));
      } catch (error) {
        console.log('Notification sound not available');
      }
    };

    loadMessages();
  }, [router]);

  // Update refs when state changes
  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  useEffect(() => {
    userProfileRef.current = userProfile;
  }, [userProfile]);

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedConversation && userProfile) {
      const loadConversationMessages = async () => {
        setLoadingConversationId(selectedConversation.id);

        try {
          const session = localStorage.getItem('supabase_session');
          const sessionData = JSON.parse(session);
          const token = sessionData.access_token;

          const response = await fetch(
            `/api/messages/${selectedConversation.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log(
              `📜 Loaded ${data.messages.length} messages for conversation`
            );
            setMessages(data.messages);

            // Clear unread count for this conversation
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === selectedConversation.id
                  ? { ...conv, unreadCount: 0 }
                  : conv
              )
            );

            // Auto-scroll to bottom after messages load
            setTimeout(() => {
              console.log('📍 Auto-scrolling to bottom of conversation');
              scrollToBottom();
            }, 100);
          } else {
            console.error('Failed to load messages');
            setMessages([]);
          }
        } catch (error) {
          console.error('Load conversation messages error:', error);
          setMessages([]);
        } finally {
          setLoadingConversationId(null);
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
      read: false,
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);
    setNewMessage('');
    setShowEmojiPicker(false); // Close emoji picker when message is sent

    // Auto-scroll after sending message
    setTimeout(() => {
      console.log('📍 Auto-scrolling after sending message');
      scrollToBottom();
    }, 50);

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: message.content }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Send message API error:', errorData);
        throw new Error(`Failed to send message: ${errorData.details || errorData.error}`);
      }

      const data = await response.json();

      // Replace optimistic message with real message from server
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? data.message : m))
      );

      // Broadcast message to other users via realtime (including attachments)
      if (realtimeChannelRef.current) {
        console.log('📤 Broadcasting message to other users');
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'new_message',
          payload: {
            message: {
              ...data.message,
              attachments: data.message.attachments || [],
            },
            conversationId: selectedConversation.id,
            senderId: userProfile.id,
          },
        });
      }
    } catch (error) {
      console.error('Send message error:', error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m.id !== message.id));
    }
  };

  const handleImageUpload = async (file) => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      // Convert file to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const response = await fetch('/api/messages/upload-attachment', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file: {
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
              },
              conversationId: selectedConversation.id,
            }),
          });

          if (response.ok) {
            const data = await response.json();
            // Send message with attachment
            await sendMessageWithAttachment(data.attachment);
          } else {
            const errorData = await response.json();
            console.error('Upload failed:', errorData);
            alert('Failed to upload image: ' + errorData.details);
          }
        } catch (error) {
          console.error('Image upload error:', error);
          alert('Failed to upload image. Please try again.');
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload error:', error);
    }
  };

  const sendMessageWithAttachment = async (attachment) => {
    const message = {
      id: Date.now().toString(),
      content: `📎 ${attachment.file_name}`,
      senderId: userProfile.id,
      timestamp: new Date(),
      read: false,
      attachments: [attachment],
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);

    // Auto-scroll after sending
    setTimeout(() => {
      scrollToBottom();
    }, 50);

    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch(`/api/messages/${selectedConversation.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `📎 ${attachment.file_name}`,
          attachmentId: attachment,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === message.id
              ? { ...data.message, attachments: data.message.attachments }
              : m
          )
        );

        // Broadcast message with attachment to other users via realtime
        if (realtimeChannelRef.current) {
          console.log('📤 Broadcasting message with attachment to other users');
          realtimeChannelRef.current.send({
            type: 'broadcast',
            event: 'new_message',
            payload: {
              message: {
                ...data.message,
                attachments: data.message.attachments || [],
              },
              conversationId: selectedConversation.id,
              senderId: userProfile.id,
            },
          });
        }
      }
    } catch (error) {
      console.error('Send message with attachment error:', error);
    }
  };

  const onEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    // Keep emoji picker open for multiple selections
  };

  const formatTime = (date) => {
    if (!date) return '-';

    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '-';

      const now = new Date();
      const diff = now - dateObj;

      if (diff < 1000 * 60) return 'Now';
      if (diff < 1000 * 60 * 60)
        return `${Math.floor(diff / (1000 * 60))}m ago`;
      if (diff < 1000 * 60 * 60 * 24)
        return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;

      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return '-';
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex'>
        <DashboardSidebar />
        <div className='flex-1 flex items-center justify-center'>
          <div className='w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen bg-gray-50 flex'>
      <DashboardSidebar />

      {/* Main Content Area - offset by sidebar width */}
      <div className='flex-1 ml-60 overflow-hidden'>
        {/* Header */}
        <header className='bg-white border-b border-gray-200 px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-gray-900 text-2xl font-semibold font-sans'>
                Messages
              </h1>
              <p className='text-gray-500 text-base font-normal font-sans'>
                Connect with buyers and sellers
              </p>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-sm text-gray-500'>
                {conversations.filter((c) => c.unreadCount > 0).length} unread
                conversations
              </span>
            </div>
          </div>
        </header>

        {/* Messages Content */}
        <div className='h-[calc(100vh-80px)] flex overflow-hidden'>
          {/* Conversations List */}
          <div className='w-80 bg-white border-r border-gray-200 flex flex-col'>
            {/* Search */}
            <div className='p-4 border-b border-gray-200'>
              <div className='relative'>
                <Search className='w-4 h-4 text-gray-400 absolute left-3 top-3' />
                <input
                  type='text'
                  placeholder='Search conversations...'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-600'
                />
              </div>
            </div>

            {/* Conversations */}
            <div className='flex-1 overflow-y-auto'>
              {conversations.length === 0 ? (
                <div className='text-center py-12'>
                  <MessageCircle className='w-12 h-12 text-gray-300 mx-auto mb-4' />
                  <h3 className='text-gray-700 text-lg font-medium font-sans mb-2'>
                    No conversations yet
                  </h3>
                  <p className='text-gray-500 text-sm font-normal font-sans'>
                    Messages will appear here when buyers contact you about your
                    listings.
                  </p>
                </div>
              ) : (
                conversations.map((conversation, conversationIndex) => (
                  <div
                    key={`conversation-${conversation.id}-${conversationIndex}`}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-green-50 border-green-200'
                        : ''
                    }`}
                  >
                    <div className='flex items-start gap-3'>
                      {/* Avatar */}
                      <div className='w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden'>
                        {loadingConversationId === conversation.id ? (
                          <div className='w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin'></div>
                        ) : conversation.otherUser.avatar ? (
                          <Image
                            src={conversation.otherUser.avatar}
                            alt={conversation.otherUser.name}
                            width={48}
                            height={48}
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <User className='w-6 h-6 text-gray-600' />
                        )}
                      </div>

                      <div className='flex-1 min-w-0'>
                        {/* User name and timestamp */}
                        <div className='flex items-center justify-between mb-1'>
                          <h4 className='text-gray-900 text-sm font-medium font-sans truncate'>
                            {conversation.otherUser.name}
                          </h4>
                          <span className='text-gray-500 text-xs font-normal font-sans'>
                            {formatTime(conversation.lastMessage.timestamp)}
                          </span>
                        </div>

                        {/* Listing info */}
                        <div className='flex items-center gap-2 mb-2'>
                          <Package className='w-3 h-3 text-gray-400' />
                          <a
                            href={`/listing/${
                              conversation.listing.slug ||
                              conversation.listing.id
                            }`}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-gray-600 text-xs font-normal font-sans truncate hover:text-green-600 transition-colors'
                            onClick={(e) => e.stopPropagation()} // Prevent conversation selection
                          >
                            {conversation.listing.title}
                          </a>
                        </div>

                        {/* Last message */}
                        <div className='flex items-center justify-between'>
                          <p className='text-gray-600 text-sm font-normal font-sans truncate flex-1'>
                            {conversation.lastMessage.content}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <span className='bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full ml-2'>
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
          <div className='flex-1 flex flex-col'>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className='bg-white border-b border-gray-200 px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className='md:hidden p-2 text-gray-400 hover:text-gray-600'
                      >
                        <ArrowLeft className='w-5 h-5' />
                      </button>

                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden'>
                          {selectedConversation.otherUser.avatar ? (
                            <Image
                              src={selectedConversation.otherUser.avatar}
                              alt={selectedConversation.otherUser.name}
                              width={40}
                              height={40}
                              className='w-full h-full object-cover'
                            />
                          ) : (
                            <User className='w-5 h-5 text-gray-600' />
                          )}
                        </div>
                        <div>
                          <h3 className='text-gray-900 text-base font-semibold font-sans'>
                            {selectedConversation.otherUser.name}
                          </h3>
                          <div className='flex items-center gap-2'>
                            <Package className='w-3 h-3 text-gray-400' />
                            <span className='text-gray-600 text-sm font-normal font-sans'>
                              {selectedConversation.listing.title}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className='flex items-center gap-2'>
                      <span className='text-gray-500 text-xs font-normal font-sans'>
                        Last seen{' '}
                        {formatTime(selectedConversation.otherUser.lastSeen)}
                      </span>
                      <button className='p-2 text-gray-400 hover:text-gray-600'>
                        <MoreVertical className='w-4 h-4' />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Listing Info Bar */}
                <div className='bg-blue-50 border-b border-blue-200 px-6 py-3'>
                  <a
                    href={`/listing/${
                      selectedConversation.listing.slug ||
                      selectedConversation.listing.id
                    }`}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-3 hover:bg-blue-100 rounded-lg p-2 -m-2 transition-colors'
                  >
                    {selectedConversation.listing.image ? (
                      <Image
                        src={selectedConversation.listing.image}
                        alt={selectedConversation.listing.title}
                        width={40}
                        height={40}
                        className='w-10 h-10 rounded-lg object-cover'
                      />
                    ) : (
                      <div className='w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center'>
                        <Package className='w-5 h-5 text-gray-600' />
                      </div>
                    )}
                    <div>
                      <h4 className='text-blue-900 text-sm font-medium font-sans hover:text-blue-700 transition-colors'>
                        {selectedConversation.listing.title}
                      </h4>
                      <p className='text-blue-700 text-xs font-normal font-sans'>
                        ${selectedConversation.listing.price.toLocaleString()}
                      </p>
                    </div>
                  </a>
                </div>

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-6 space-y-4'>
                  {messages.map((message, index) => {
                    const isOwn = message.senderId === userProfile?.id;

                    return (
                      <div
                        key={`${message.id}-${index}`}
                        className={`flex items-start gap-3 ${
                          isOwn ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        {/* Profile Photo */}
                        <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden'>
                          {isOwn ? (
                            sessionAvatar ? (
                              <Image
                                src={sessionAvatar}
                                alt="Your avatar"
                                width={32}
                                height={32}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <User className='w-5 h-5 text-gray-600' />
                            )
                          ) : (
                            selectedConversation.otherUser.avatar ? (
                              <Image
                                src={selectedConversation.otherUser.avatar}
                                alt={selectedConversation.otherUser.name}
                                width={32}
                                height={32}
                                className='w-full h-full object-cover'
                              />
                            ) : (
                              <User className='w-5 h-5 text-gray-600' />
                            )
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? 'bg-green-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-900 rounded-bl-md'
                          }`}
                        >
                          {/* Image Attachments */}
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className='mb-2 space-y-2'>
                                {message.attachments.map(
                                  (attachment, attachIndex) =>
                                    attachment.file_type?.startsWith(
                                      'image/'
                                    ) && (
                                      <div
                                        key={`${attachment.id}-${attachIndex}`}
                                      >
                                        <Image
                                          src={attachment.file_url}
                                          alt={attachment.file_name}
                                          width={100}
                                          height={100}
                                          className='w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity'
                                          onClick={() =>
                                            setSelectedImage(
                                              attachment.file_url
                                            )
                                          }
                                        />
                                      </div>
                                    )
                                )}
                              </div>
                            )}

                          <p className='text-sm font-normal font-sans leading-5'>
                            {message.content}
                          </p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 ${
                              isOwn ? 'text-green-100' : 'text-gray-500'
                            }`}
                          >
                            <span className='text-xs font-normal font-sans'>
                              {formatTime(message.timestamp)}
                            </span>
                            {isOwn && (
                              <div className='flex'>
                                {message.read ? (
                                  <CheckCheck className='w-3 h-3' />
                                ) : (
                                  <Check className='w-3 h-3' />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className='bg-white border-t border-gray-200 p-4'>
                  {/* Emoji Picker */}
                  {showEmojiPicker && (
                    <div className='mb-4'>
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        width='100%'
                        height={300}
                      />
                    </div>
                  )}

                  <div className='flex items-center gap-3'>
                    {/* Emoji Button */}
                    <button
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className='w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors'
                    >
                      <Smile className='w-5 h-5' />
                    </button>

                    {/* Attachment Button */}
                    <button
                      onClick={() =>
                        document.getElementById('attachment-upload').click()
                      }
                      className='w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors'
                    >
                      <Paperclip className='w-5 h-5' />
                    </button>

                    <input
                      id='attachment-upload'
                      type='file'
                      accept='image/*'
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                        }
                      }}
                      className='hidden'
                    />

                    <div className='flex-1'>
                      <input
                        type='text'
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder='Type a message...'
                        className='w-full bg-gray-100 rounded-full px-4 py-2 text-sm font-normal font-sans focus:outline-none focus:ring-2 focus:ring-green-600 focus:bg-white transition-colors'
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className='w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed'
                    >
                      <Send className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* No conversation selected */
              <div className='flex-1 flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                  <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                    <MessageCircle className='w-8 h-8 text-gray-400' />
                  </div>
                  <h3 className='text-gray-700 text-lg font-medium font-sans mb-2'>
                    Select a conversation
                  </h3>
                  <p className='text-gray-500 text-sm font-normal font-sans'>
                    Choose a conversation from the list to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Image Modal */}
        {selectedImage && (
          <div
            className='fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50'
            onClick={() => setSelectedImage(null)}
          >
            <div className='relative max-w-4xl max-h-full'>
              <button
                onClick={() => setSelectedImage(null)}
                className='absolute top-4 right-4 w-10 h-10 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
              <Image
                src={selectedImage}
                width={1000}
                height={1000}
                alt='Full size image'
                className='max-w-full max-h-full object-contain rounded-lg'
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
