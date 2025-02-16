'use client';
import { useEffect, useState } from 'react';
import { Bell, AlertTriangle, ClipboardList, CheckCircle, Triangle, Trash, Eye, EyeOff } from 'lucide-react';
import { mockNotifications } from '@/app/lib/data';
import { Notification, NotificationType } from '@/app/lib/type';

export default function NotificationsPage() {

    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterType, setFilterType] = useState<NotificationType|'all'>('all');
    const [showArchived, setShowArchived] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [notificationsPerPage, setNotificationsPerPage] = useState<number>(5);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case 'low-stock':
                return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
            case 'new-request':
                return <ClipboardList className="w-5 h-5 text-blue-600" />;
            case 'action-needed':
                return <Triangle className="w-5 h-5 text-red-600" />;
            case 'system-alert':
                return <Bell className="w-5 h-5 text-gray-600" />;
            default: 
                return <Bell className="w-5 h-5 text-gray-600" />;
        }
    };

    const markAsRead = (id: number) => {
        setNotifications(notifications.map(notification => 
            notification.id === id ? {...notification, read: true} : notification
        ));
    }

    const deleteNotification = (id: number) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    }

    const filteredNotifications = notifications.filter(notification => {
        (showArchived && !notification.read) &&
        (filterType === 'all' || notification.type === filterType) &&
        (!searchQuery || !notification.message.toLowerCase().includes(searchQuery.toLowerCase())) 
    });

    // Pagination Calculations
    const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage);
    const startIndex = (currentPage - 1) * notificationsPerPage;
    const paginatedNotifications = filteredNotifications.slice(startIndex, startIndex + notificationsPerPage);

    // Reset to first page when changing filters
    useEffect(() => {
        setCurrentPage(1);
    }, [filterType, showArchived, searchQuery]);

    // Ensure current page is valid after filtering
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
    } else if (filteredNotifications.length === 0) {
        setCurrentPage(1);
    }
    }, [filteredNotifications, currentPage, totalPages, notificationsPerPage]);

    return(
        <div className="p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">NOTIFICATIONS</h1>
                <div className='flex items-center gap-4 w-full md:auto'>
                    <div className='relative flex-1'>
                        <Bell className='absolute left-3 top-3 w-5 h-5 text-gray-400'/>
                        <input 
                            type = 'text' 
                            placeholder='Search notifications...' 
                            className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring focus:ring-blue-200' 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select 
                        className='w-40 rounded-lg border border-gray-200 focus:outline-none focus:ring focus:ring-blue-200'
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as NotificationType|'all')}
                    >
                        <option value='all'>All Notifications</option>
                        <option value='low-stock'>Low Stock</option>
                        <option value='new-request'>New Request</option>
                        <option value='action-needed'>Action Needed</option>
                        <option value='system-alert'>System Alert</option>
                    </select>

                    <button 
                        className='flex items-center gap-1 bg-gray-200 text-gray-500 hover:bg-gray-800'
                        onClick={() => setShowArchived(!showArchived)}
                    >
                        {showArchived ? <Eye className='w-5 h-5'/> : <EyeOff className='w-5 h-5'/>}
                        <span>{showArchived ? 'Hide Archived' : 'Show Archived'}</span>
                    </button>
                </div>
            </div>

            {/* Notifications List */} 
            <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                <div className='divide-y divide-gray-200'>
                    {paginatedNotifications.map(notifications => (
                        <div
                            key={notifications.id}
                            className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 ${notifications.read ? 'bg-gray-50' : 'bg-white'}`}
                        >
                            <div className='flex items-center gap-4'>
                                {getIcon(notifications.type)}
                            </div>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-1'>
                                        <p className='text-sm font-semibold text-gray-800'>{notifications.message}</p>
                                        {!notifications.read && (<span className='px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full'>New</span>)}
                                    </div>
                                        <p className='text-xs text-gray-500'>
                                            {new Date(notifications.date).toLocaleDateString('en-US', 
                                            {weekday: 'short', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric', 
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                }
                                            )}
                                        </p>
                                        {notifications.relatedItem && (<span className='inline-block mt-2 px-2 py-1 text-xs bg-gray-100 rounded-lg'>
                                            Related Item: {notifications.relatedItem} </span>)}
                                </div>
                                <div className='flex gap-2'>
                                    {!notifications.read && (
                                        <button 
                                            onClick={() => markAsRead(notifications.id)}
                                            className='p-2 text-gray-600 hover:text-indigo-600'
                                            title='Mark as Read'
                                        >
                                            <CheckCircle className='w-5 h-5'/>
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => deleteNotification(notifications.id)}
                                        className='p-2 text-gray-600 hover:text-indigo-600'
                                        title='Delete Notification'
                                    >
                                        <Trash className='w-5 h-5'/>
                                    </button>
                                </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Empty State */}
            {filteredNotifications.length === 0 && (
                <div className='text-center py-12'>
                    <Bell className='w-12 h-12 text-gray-400 mx-auto'/>
                    <h3 className='mt-12 text-sm font-semibold text-gray-900'>No notifications found</h3>
                
                    <p className='mt-1 text-sm text-gray-500'>
                        Try adjusting your search query or filters
                    </p>
                </div>
            )}

            {/* Bulk actions & pagination */}
            <div className='mt-6 flex flex-col gap-4'>
                <div className='flex justify-between items-center'>
                    <div className='text-sm text-gray-600'>
                        Showing {filteredNotifications.length} of {notifications.length} notifications
                    </div>
                    <button 
                        onClick={() => setNotifications(notifications.map(notification => ({...notification, read: true})))}
                        className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-600'
                    >
                        Mark All as Read
                    </button>
                </div>

                {filteredNotifications.length > 0 && (
                    <div className='flex flex-col sm:flex-row justify-between items-center gap-4'>
                        <div className='flex items-center gap-4'>
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className='px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200'
                            >
                                Previous
                            </button>
                            <span className='text-sm text-gray-600'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className='px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200'
                            >
                                Next
                            </button>
                        </div>
                        <select
                            value={notificationsPerPage}
                            onChange={(e) => {setNotificationsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className='px-4 py-2 rounded-lg border border-gray-200'
                            >
                                <option value='5'>
                                    5 per page
                                </option>
                                <option value='10'>
                                    10 per page
                                </option>
                                <option value='20'>
                                    20 per page
                                </option>
                        </select>
                    </div>
                )}
            </div>
        </div>
    )
}

