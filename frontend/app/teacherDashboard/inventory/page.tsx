'use client';
import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash } from "lucide-react";

export type InventoryStatus = "in_stock" | "low_stock" | "out_of_stock";

interface RawTeacherInventoryItem {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
    is_custom: boolean;
  };
  quantity: number;
  low_stock_threshold: number;
  status: InventoryStatus;
  created_at: string;
  updated_at: string;
}

export interface TeacherInventoryItem {
  id: number;
  name: string;
  category: string;
  quantity: number;
  low_stock_threshold: number;
  status: InventoryStatus;
  created_at?: string;
  updated_at?: string;
}

interface Category {
  id?: number;
  name: string;
  is_custom?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

export default function TeacherInventoryPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<TeacherInventoryItem[]>([]);
  const [editingItem, setEditingItem] = useState<TeacherInventoryItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<TeacherInventoryItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherInventoryItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/inventory/teacher/inventory/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: RawTeacherInventoryItem[] = await response.json();
      setItems(data.map((item: RawTeacherInventoryItem) => ({
        ...item,
        category: item.category.name,
        status: calculateItemStatus(item.quantity, item.low_stock_threshold)
      })));
    } catch (error) {
      console.error("Error fetching teacher inventory items:", error);
      setError("Failed to load teacher inventory items. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateItemStatus = (quantity: number, threshold: number): InventoryStatus => {
    if (quantity <= 0) return "out_of_stock";
    if (quantity <= threshold) return "low_stock";
    return "in_stock";
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/inventory/categories/`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Failed to load categories. Please try again.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const categoryName = formData.get('category') as string;
    
    const selectedCategory = categories.find(cat => cat.name === categoryName);
    
    if (!selectedCategory) {
      setError("Invalid category selected");
      return;
    }

    const itemData = {
      name: formData.get('name') as string,
      category_id: selectedCategory.id,
      quantity: Number(formData.get('quantity')),
      low_stock_threshold: Number(formData.get('low_stock_threshold')),
    };

    try {
      const url = editingItem 
        ? `${API_URL}/inventory/teacher/inventory/${editingItem.id}/`
        : `${API_URL}/inventory/teacher/inventory/`;

      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to ${method === 'PUT' ? 'update' : 'create'} item: ${JSON.stringify(errorData)}`);
      }

      await fetchTeacherInventoryItems();
      setShowModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving item:", error);
      setError(editingItem ? "Failed to update item." : "Failed to create item.");
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    setError(null);

    try {
      const response = await fetch(`${API_URL}/inventory/teacher/inventory/${deletingItem.id}/`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }

      await fetchTeacherInventoryItems();
      setDeletingItem(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      setError("Failed to delete item. Please try again.");
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchTeacherInventoryItems(),
        fetchCategories(),
      ]);
    };
    
    loadData();
  }, []);

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    if (filteredItems.length === 0 && currentPage > 1) {
      setCurrentPage(1);
    }
  }, [filteredItems, currentPage]);

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">TEACHER INVENTORY</h1>
        <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm w-full md:w-96">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teacher inventory..."
            className="ml-2 outline-none bg-transparent w-full"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button
          onClick={() => {
            setShowModal(true);
            setEditingItem(null);
          }}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          <span>Add Item</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        {items.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No teacher inventory items found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Item Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-800">{item.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                        item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.status === 'in_stock' ? 'In Stock' :
                         item.status === 'low_stock' ? 'Low Stock' :
                         'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(item);
                            setShowModal(true);
                          }}
                          className="text-indigo-600 hover:text-indigo-800"
                          aria-label="Edit item"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setDeletingItem(item)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete item"
                        >
                          <Trash className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {items.length > 0 && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:text-indigo-800'}`}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">
                {editingItem ? "Edit Teacher Inventory Item" : "Add New Teacher Inventory Item"}
              </h2>
              {error && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Name*
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={editingItem?.name}
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category*
                    </label>
                    <select
                      name="category"
                      id="category"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={editingItem?.category || ""}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.name} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity*
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      min="0"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={editingItem?.quantity || 0}
                    />
                  </div>
                  <div>
                    <label htmlFor="low_stock_threshold" className="block text-sm font-medium text-gray-700 mb-1">
                      Low Stock Threshold*
                    </label>
                    <input
                      type="number"
                      name="low_stock_threshold"
                      id="low_stock_threshold"
                      min="0"
                      required
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                      defaultValue={editingItem?.low_stock_threshold || 5}
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingItem(null);
                      setError(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {editingItem ? "Save Changes" : "Add Item"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deletingItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6">Are you sure you want to delete <span className="font-semibold">"{deletingItem.name}"</span>? This action cannot be undone.</p>
              {error && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setDeletingItem(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}