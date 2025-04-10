'use client';
import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, XCircle, Trash } from 'lucide-react';

interface Notification {
  id: number;
  message: string;
  type: 'teacher-low-stock' | 'request-approved' | 'request-rejected';
  read: boolean;
  created_at: string;
  related_item?: { name: string };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function TeacherNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/notifications/`)
      .then(res => res.json())
      .then(data => {
        // Filter for teacher-relevant notifications
        const teacherNotifications = data.filter((n: Notification) => 
          ['teacher-low-stock', 'request-approved', 'request-rejected'].includes(n.type)
        );
        setNotifications(teacherNotifications);
        setLoading(false);
      });
  }, []);

  const markAsRead = (id: number) => {
    fetch(`${API_URL}/notifications/${id}/mark_as_read/`, { method: 'POST' })
      .then(() => {
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ));
      });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">My Notifications</h1>
      
      <div className="space-y-3">
        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No notifications found
          </div>
        )}

        {notifications.map(notification => (
          <div 
            key={notification.id}
            className={`p-3 border rounded-lg ${
              !notification.read ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start gap-3">
              {notification.type === 'teacher-low-stock' && (
                <AlertTriangle className="text-orange-600 mt-1" />
              )}
              {notification.type === 'request-approved' && (
                <CheckCircle className="text-green-600 mt-1" />
              )}
              {notification.type === 'request-rejected' && (
                <XCircle className="text-red-600 mt-1" />
              )}
              
              <div className="flex-1">
                <p>{notification.message}</p>
                {notification.related_item && (
                  <p className="text-sm text-gray-600">
                    Item: {notification.related_item.name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(notification.created_at).toLocaleString()}
                </p>
              </div>

              {!notification.read && (
                <button 
                  onClick={() => markAsRead(notification.id)}
                  className="p-1 text-gray-500 hover:text-blue-600"
                  title="Mark as read"
                >
                  <CheckCircle size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}