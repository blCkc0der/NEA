'use client';

import { useState, useEffect } from 'react';
import { BellIcon, CheckIcon, CheckCircleIcon, AlertTriangleIcon, RotateCw, Filter } from 'lucide-react';

interface ContentObject {
  id: number;
  type: string;
  display?: string;
  repr?: string;
}

interface Notification {
  id: number;
  notification_type: 'low_stock' | 'new_request' | 'stock_updated' | 'LOW_STOCK' | 'NEW_REQUEST' | 'STOCK_UPDATED';
  message: string;
  is_read: boolean;
  timestamp: string;
  link?: string;
  content_object?: ContentObject;
  recipient_email?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function StockManagerNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('unread');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`${API_URL}/notifications/`);
      if (filter === 'unread') {
        url.searchParams.append('is_read', 'false');
      }

      const response = await fetch(url.toString(), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      // Handle both array and object responses
      const receivedNotifications = Array.isArray(data) ? data : 
                                  data.results ? data.results : 
                                  data.notifications ? data.notifications : [];

      // Filter for stock manager notifications (case insensitive)
      const stockManagerNotifications = receivedNotifications.filter((n: Notification) => {
        const type = n.notification_type.toLowerCase();
        return ['low_stock', 'new_request', 'stock_updated'].includes(type);
      });

      // Calculate unread count from filtered notifications
      const unread = stockManagerNotifications.filter((n: Notification) => !n.is_read).length;

      setNotifications(stockManagerNotifications);
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Fetch Error:', error);
      setError(error.message || 'Failed to fetch notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/mark_as_read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Mark as read failed: ${response.status}`);

      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark_all_as_read/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error(`Mark all as read failed: ${response.status}`);

      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'low_stock':
        return <AlertTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'new_request':
        return <BellIcon className="h-5 w-5 text-blue-500" />;
      case 'stock_updated':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityClass = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case 'low_stock':
        return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'new_request':
        return 'border-l-4 border-blue-500 bg-blue-50';
      case 'stock_updated':
        return 'border-l-4 border-green-500 bg-green-50';
      default:
        return '';
    }
  };

  const getContentObjectDisplay = (contentObject?: ContentObject) => {
    if (!contentObject) return '';
    return contentObject.display || contentObject.repr || '';
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory Notifications</h1>
          <p className="text-sm text-gray-500">
            {unreadCount} unread {unreadCount === 1 ? 'notification' : 'notifications'} • Showing {filter}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
            title="Refresh"
          >
            <RotateCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
              disabled={isLoading}
              className={`px-3 py-2 rounded-md flex items-center gap-1 ${
                filter === 'unread' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              } disabled:opacity-50`}
            >
              <Filter className="h-4 w-4" />
              {filter === 'all' ? 'All' : 'Unread'}
            </button>
          </div>
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0 || isLoading}
            className={`px-4 py-2 rounded-md flex items-center ${
              unreadCount === 0 ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-800 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Mark All Read
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          <div className="flex justify-between">
            <p className="font-medium">Error loading notifications</p>
            <button onClick={() => setError(null)} className="font-bold">×</button>
          </div>
          <p className="mt-1 text-sm">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-8 text-center">
          <BellIcon className="h-12 w-12 text-gray-300 mx-auto" />
          <p className="mt-2 text-gray-500">
            No {filter === 'unread' ? 'unread' : ''} notifications found
          </p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
          >
            Refresh
          </button>
        </div>
      ) : (
        <ul className="bg-white rounded-lg shadow-sm border divide-y divide-gray-200">
          {notifications.map(notification => (
            <li 
              key={notification.id} 
              className={`${!notification.is_read ? 'bg-blue-50' : 'bg-white'} ${getPriorityClass(notification.notification_type)} hover:bg-gray-50 transition-colors`}
            >
              <div className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 pt-1">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <div>
                        <p className={`text-sm ${!notification.is_read ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {notification.message}
                        </p>
                        {notification.content_object && (
                          <p className="mt-1 text-xs text-gray-500">
                            Related: {getContentObjectDisplay(notification.content_object)}
                          </p>
                        )}
                      </div>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex-shrink-0 text-blue-600 hover:text-blue-800"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >
                        View Details
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
