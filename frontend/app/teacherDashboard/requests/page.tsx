'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
}

interface SelectedItem {
  id: number;
  name: string;
  quantity: number;
}

interface Request {
  id: number;
  item: InventoryItem;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function RequestsPage() {
  const [currentView, setCurrentView] = useState<'my-requests' | 'new-request'>('my-requests');

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setCurrentView('my-requests')}
          className={`px-4 py-2 rounded-lg ${currentView === 'my-requests' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
        >
          My Requests
        </button>
        <button
          onClick={() => setCurrentView('new-request')}
          className={`px-4 py-2 rounded-lg ${currentView === 'new-request' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}`}
        >
          New Request
        </button>
      </div>
      {currentView === 'my-requests' ? <MyRequestsView /> : <NewRequestView />}
    </div>
  );
}

function MyRequestsView() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/requests/requests/`);
      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching requests:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const statusStyles: Record<Request['status'], string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">My Requests</h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
            <button 
              onClick={fetchRequests}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Retry
            </button>
          </div>
        )}
        {requests.length === 0 && !error ? (
          <p className="text-gray-600">No requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Quantity</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date Sent</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{request.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[request.status]}`}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function NewRequestView() {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [notes, setNotes] = useState<string>('');
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/inventory/inventory/`);
      if (!response.ok) {
        throw new Error('Failed to fetch inventory');
      }
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('Error fetching inventory:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddItem = (item: InventoryItem) => {
    if (selectedItems.some(selected => selected.id === item.id)) {
      setError('Item already added to request');
      return;
    }
    setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
  };

  const handleRemoveItem = (id: number) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };

  const handleQuantityChange = (id: number, quantity: number) => {
    const maxQuantity = items.find(i => i.id === id)?.quantity || 1;
    setSelectedItems(
      selectedItems.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, maxQuantity)),
            }
          : item
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Validate items still exist in inventory
      const validItems = selectedItems.filter(item => 
        items.some(invItem => invItem.id === item.id)
      );
      
      if (validItems.length !== selectedItems.length) {
        throw new Error('Some items are no longer available');
      }

      // Prepare payloads with validation
      const payloads = selectedItems.map(item => {
        const inventoryItem = items.find(i => i.id === item.id);
        return {
          item_id: item.id,
          quantity: item.quantity,
          notes: notes || '',
          available_quantity: inventoryItem?.quantity || 0
        };
      });

      console.log("Submitting requests:", payloads);

      const results = await Promise.all(
        payloads.map(payload => 
          fetch(`${API_URL}/requests/requests/`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }).then(res => {
            if (!res.ok) {
              return res.json().then(err => { throw err; });
            }
            return res.json();
          })
        )
      );

      console.log("Submission successful:", results);
      alert('Requests submitted successfully!');
      setSelectedItems([]);
      setNotes('');
    } catch (error: any) {
      console.error("Submission error:", error);
      let errorMessage = 'Failed to submit requests';
      
      if (error.item_id) {
        errorMessage = `Invalid item: ${error.item_id.join(', ')}`;
      } else if (error.detail) {
        errorMessage = error.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h1 className="text-2xl font-bold mb-6">New Request</h1>
      
      {isLoading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-lg">
          <p>Loading inventory...</p>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Select Items</h2>
        {!isLoading && items.length === 0 ? (
          <p className="text-gray-600">No inventory items found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div key={item.id} className="border p-4 rounded-lg hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.quantity} in stock</p>
                  </div>
                  <button
                    onClick={() => handleAddItem(item)}
                    className={`px-3 py-1.5 rounded-md transition-colors ${
                      selectedItems.some(selected => selected.id === item.id)
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                    disabled={selectedItems.some(selected => selected.id === item.id)}
                  >
                    {selectedItems.some(selected => selected.id === item.id) ? 'Added' : 'Add'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {selectedItems.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Selected Items</h2>
          <div className="space-y-3">
            {selectedItems.map(item => {
              const inventoryItem = items.find(i => i.id === item.id);
              const maxAvailable = inventoryItem?.quantity || 0;
              
              return (
                <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Max available: {maxAvailable}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={e => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border rounded-md text-center"
                      min="1"
                      max={maxAvailable}
                    />
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Additional Notes</h2>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          rows={4}
          placeholder="Add any special instructions or notes..."
        />
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={selectedItems.length === 0 || isSubmitting}
        className={`w-full py-2.5 rounded-lg transition-colors ${
          selectedItems.length === 0 || isSubmitting
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </span>
        ) : 'Submit Request'}
      </button>
    </div>
  );
}