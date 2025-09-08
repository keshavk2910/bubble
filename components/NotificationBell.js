import { useState, useEffect, useRef } from 'react';
import {
  Bell,
  X,
  Check,
  CheckCheck,
  MessageCircle,
  Star,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { supabaseClient } from '../lib/supabase';
import { useRouter } from 'next/router';
export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef(null);
  const router = useRouter();
  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) return;

        const sessionData = JSON.parse(session);
        const token = sessionData.access_token;

        // Get notifications
        const notificationsResponse = await fetch(
          '/api/notifications?limit=10',
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (notificationsResponse.ok) {
          const notificationData = await notificationsResponse.json();
          setNotifications(notificationData.notifications);

          // Calculate unread count from notifications array
          const unread = notificationData.notifications
            ? notificationData.notifications.filter((n) => !n.read).length
            : 0;
          setUnreadCount(unread);
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      } catch (error) {
        console.error('Load notifications error:', error);
        setNotifications([]);
        setUnreadCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, []);

  // Set up realtime subscriptions for notifications
  useEffect(() => {
    const setupNotificationRealtime = async () => {
      try {
        const session = localStorage.getItem('supabase_session');
        if (!session) return;

        const sessionData = JSON.parse(session);
        const userResponse = await fetch('/api/me', {
          headers: {
            Authorization: `Bearer ${sessionData.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) return;

        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Set user session for realtime
        await supabaseClient.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });

        // Subscribe to new notifications
        const channel = supabaseClient
          .channel(`notifications-${userId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              console.log('New notification received:', payload);

              const newNotification = {
                id: payload.new.id,
                type: payload.new.type,
                title: payload.new.title,
                message: payload.new.message,
                read: payload.new.read,
                data: payload.new.data,
                created_at: payload.new.created_at,
              };

              // Add to notifications list
              setNotifications((prev) => {
                const updated = [newNotification, ...prev.slice(0, 9)];
                // Update unread count based on new notifications array
                setUnreadCount(updated.filter((n) => !n.read).length);
                return updated;
              });

              // Play notification sound
              playNotificationSound();
            }
          )
          .subscribe();

        return () => {
          channel.unsubscribe();
        };
      } catch (error) {
        console.error('Notification realtime setup error:', error);
      }
    };

    setupNotificationRealtime();
  }, []);

  // Whenever notifications change, recalculate unreadCount
  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.read).length);
  }, [notifications]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio
        .play()
        .catch((e) => console.log('Could not play notification sound:', e));
    } catch (error) {
      console.log('Notification sound not available');
    }
  };

  const markAsRead = async (notificationId) => {
    console.log('notificationId', notificationId);
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        // Update local state
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        // unreadCount will be recalculated by useEffect([notifications])
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const session = localStorage.getItem('supabase_session');
      const sessionData = JSON.parse(session);
      const token = sessionData.access_token;

      const unreadNotifications = notifications.filter((n) => !n.read);

      for (const notification of unreadNotifications) {
        await markAsRead(notification.id);
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'listing_approved':
        return <Star className='w-4 h-4 text-green-600' />;
      case 'listing_rejected':
        return <X className='w-4 h-4 text-red-600' />;
      case 'new_message':
        return <MessageCircle className='w-4 h-4 text-blue-600' />;
      case 'account_verified':
        return <Shield className='w-4 h-4 text-purple-600' />;
      default:
        return <Bell className='w-4 h-4 text-gray-600' />;
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;

      if (diff < 1000 * 60) return 'Just now';
      if (diff < 1000 * 60 * 60)
        return `${Math.floor(diff / (1000 * 60))}m ago`;
      if (diff < 1000 * 60 * 60 * 24)
        return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;

      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return '';
    }
  };

  return (
    <div className='relative' ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className='relative p-2 text-gray-600 hover:text-gray-800 transition-colors'
      >
        <Bell className='w-5 h-5' />
        {unreadCount > 0 && (
          <span className='absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center'>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      {showDropdown && (
        <div className='absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-gray-200 shadow-lg z-50'>
          {/* Header */}
          <div className='px-4 py-3 border-b border-gray-200 flex items-center justify-between'>
            <h3 className='text-gray-900 text-base font-semibold font-sans'>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className='text-green-600 text-sm font-medium hover:text-green-700 transition-colors'
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className='max-h-96 overflow-y-auto'>
            {isLoading ? (
              <div className='p-8 text-center'>
                <div className='w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto'></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className='p-8 text-center'>
                <Bell className='w-8 h-8 text-gray-300 mx-auto mb-3' />
                <h4 className='text-gray-700 text-sm font-medium mb-1'>
                  No notifications
                </h4>
                <p className='text-gray-500 text-xs'>
                  You&apos;re all caught up!
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-green-50' : ''
                  }`}
                  onClick={() => {
                    //if notification type is new_message onclick send to messages page
                    if (notification.type === 'new_message') {
                      console.log('new_message');
                      markAsRead(notification.id);
                      router.push(
                        `/dashboard/messages?conversation=${notification.data.conversation_id}`
                      );
                    }
                  }}
                >
                  <div className='flex items-start gap-3'>
                    <div className='flex-shrink-0 mt-0.5'>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center justify-between mb-1'>
                        <div className='flex items-center gap-2'>
                          <h4 className='text-gray-900 text-sm font-medium truncate'>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className='w-2 h-2 bg-green-600 rounded-full flex-shrink-0'></div>
                          )}
                        </div>
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className='flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 transition-colors'
                            title='Mark as read'
                          >
                            <Check className='w-3 h-3' />
                          </button>
                        )}
                      </div>
                      <p className='text-gray-600 text-xs leading-4 mb-1'>
                        {notification.message}
                      </p>
                      <span className='text-gray-500 text-xs'>
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {/* {notifications.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200">
              <button className="w-full text-green-600 text-sm font-medium hover:text-green-700 transition-colors">
                View all notifications
              </button>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
}
