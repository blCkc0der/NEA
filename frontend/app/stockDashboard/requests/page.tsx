"use client";

import { useState, useEffect } from "react";
import { Search, ClipboardList, CheckCircle, XCircle, User, BookOpen, Clock } from 'lucide-react';

interface Subject {
  id: number;
  name: string;
  description: string;
}

interface ClassInfo {
  id: number;
  name: string;
  grade_level: string;
  description: string;
}

interface TeacherClassSubject {
  id: number;
  class_taught: ClassInfo;
  subject: Subject;
}

interface TeacherProfile {
  id?: number;
  bio?: string;
  class_subjects?: TeacherClassSubject[];
  user?: User;
}

interface User {
  id?: number;
  email?: string;
  first_name?: string;
  last_name?: string;
}

interface InventoryItem {
  id?: number;
  name?: string;
  quantity?: number;
}

interface InventoryRequest {
  id: number;
  user?: User;
  item?: InventoryItem;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at?: string;
  teacher_profile?: TeacherProfile;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function RequestPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/requests/requests/`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const getTeacherName = (user?: User) => {
    if (!user) return 'N/A';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email || 'N/A';
  };

  const getTeacherClasses = (request: InventoryRequest | null) => {
    const profile = request?.teacher_profile;
    if (!profile?.class_subjects?.length) return 'N/A';

    const uniqueClasses = new Map<number, string>();
    profile.class_subjects.forEach((cs) => {
      if (cs.class_taught) {
        const className = cs.class_taught.grade_level 
          ? `${cs.class_taught.name} (${cs.class_taught.grade_level})`
          : cs.class_taught.name;
        uniqueClasses.set(cs.class_taught.id, className);
      }
    });

    return uniqueClasses.size > 0 
      ? Array.from(uniqueClasses.values()).join(', ') 
      : 'N/A';
  };

  const getStatusBadge = (status: string) => {
    const baseStyle = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const statusStyle = statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800';
    return (
      <span className={`${baseStyle} ${statusStyle}`}>
        {status}
        {status === 'pending' && <Clock className="ml-1 h-3 w-3" />}
        {status === 'approved' && <CheckCircle className="ml-1 h-3 w-3" />}
        {status === 'rejected' && <XCircle className="ml-1 h-3 w-3" />}
      </span>
    );
  };

  const deductFromInventory = async (itemId: number, quantity: number) => {
    try {
      const response = await fetch(`${API_URL}/inventory/inventory/items/${itemId}/deduct/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to deduct from inventory');
      }

      return await response.json();
    } catch (error) {
      console.error('Inventory deduction error:', error);
      throw error;
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!selectedRequest?.id) return;

    const originalRequests = [...requests];
    setRequests(requests.map(req =>
      req.id === selectedRequest.id ? { ...req, status: newStatus } : req
    ));
    setShowModal(false);

    try {
      // First update the request status
      const response = await fetch(`${API_URL}/requests/requests/${selectedRequest.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update request status');
      }

      const updatedRequest = await response.json();
      setRequests(originalRequests.map(req => 
        req.id === selectedRequest.id ? updatedRequest : req
      ));

      // If approved, deduct from inventory
      if (newStatus === 'approved' && selectedRequest.item?.id && selectedRequest.quantity) {
        await deductFromInventory(selectedRequest.item.id, selectedRequest.quantity);
        setSuccessMessage(`Request approved and ${selectedRequest.quantity} items deducted from inventory`);
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
      setRequests(originalRequests);
      setShowModal(true);
    }
  };

  const filteredRequests = requests.filter((request) => {
    const query = searchQuery.toLowerCase();
    const teacherName = getTeacherName(request.user).toLowerCase();
    const teacherClasses = getTeacherClasses(request).toLowerCase();
    const itemName = request.item?.name?.toLowerCase() || '';
    const status = request.status.toLowerCase();
    
    return (
      teacherName.includes(query) ||
      teacherClasses.includes(query) ||
      itemName.includes(query) ||
      status.includes(query)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return (
    <div className="p-6 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 bg-red-50 text-red-600 rounded-lg">
      <p>Error: {error}</p>
      <button 
        onClick={fetchRequests}
        className="mt-2 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className='p-6'>
      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-800 rounded-lg">
          {successMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-blue-600" />
          Teacher Requests
        </h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by teacher, class, item or status..."
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentItems.length > 0 ? (
                currentItems.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium text-gray-900">
                          {getTeacherName(request.user)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span>{getTeacherClasses(request)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {request.item?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                      {request.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No requests found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRequests.length > 0 && (
        <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
          <div className="text-sm text-gray-500">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRequests.length)} of {filteredRequests.length} requests
          </div>
          <div className="flex gap-1">
            {Array.from({ length: Math.ceil(filteredRequests.length / itemsPerPage) }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === i + 1 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-500" />
                  Request Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                    <div className="p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      {getTeacherName(selectedRequest.user)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classes</label>
                    <div className="p-2 bg-gray-50 rounded-lg flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      {getTeacherClasses(selectedRequest)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item</label>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {selectedRequest.item?.name || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {selectedRequest.quantity}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="p-2">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>

                {selectedRequest.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <div className="p-2 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}
              </div>

              {selectedRequest.status === 'pending' && (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-800 hover:bg-green-100 px-4 py-2 rounded-lg border border-green-200 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Approve
                  </button>
                  <button
                    onClick={() => handleStatusUpdate('rejected')}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-800 hover:bg-red-100 px-4 py-2 rounded-lg border border-red-200 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="w-full mt-6 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {requests.length === 0 && !loading && (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 mt-6">
          <ClipboardList className="w-12 h-12 mx-auto text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No requests available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Teachers haven't made any requests yet
          </p>
        </div>
      )}
    </div>
  );
}