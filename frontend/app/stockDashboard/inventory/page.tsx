'use client';

import { useState } from "react";
import {Search, Plus, Pencil, Trash} from "lucide-react";
import {mockInventoryItems} from "@/app/lib/data";
import {InventoryItem} from "@/app/lib/type";

export default function InventoryPage() {
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [items, setItems] = useState<InventoryItem[]>(mockInventoryItems);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<InventoryItem | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newItem: Omit<InventoryItem, "id"> = {
            name: formData.get("name") as string,
            category: formData.get("category") as string,
            quantity: Number(formData.get("quantity")),
            status: Number(formData.get("quantity")) > 10 ? "In Stock" : 
                    Number(formData.get("quantity")) > 0 ? "Low Stock" : "Out of Stock",
        };

        if (editingItem) {
            setItems(items.map(item => 
                item.id === editingItem.id ? {...item, ...newItem} : item
            ));
            setEditingItem(null);
        } else {
            setItems([...items, {...newItem, id: Date.now()}]);
        }

        setShowModal(false);
        setEditingItem(null);
    };

     //Filter items based on search query
     const filteredItems = items.filter((item) => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">INVENTORY</h1>
                <div className="flex items-center bg-white rounded-lg shadow-md px-4 py-2 w-full md:w-96">
                    <Search className="w-5 h-5 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Search inventory...."
                        className="w-full ml-2 outline-none bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        />
                </div>
                <button
                    onClick={() => {
                        setShowModal(true);
                        setEditingItem(null);
                    }}
                    className="flex items-center bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
                >
                    <Plus className="w-5 h-5 mr-2"/>
                    <span> Add Item </span>
                </button>
            </div>
            
            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500"> Item Name</th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500"> Category </th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500"> Quantity </th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500"> Status </th>
                            <th className="py-4 px-6 text-left text-sm font-semibold text-gray-500"> Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover: bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-800"> {item.name} </td>  
                                <td className="px-6 py-4 text-sm text-gray-600"> {item.category} </td>  
                                <td className="px-6 py-4 text-sm text-gray-600"> {item.quantity} </td>  
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        item.status === "In Stock" ? "bg-green-100 text-green-800" : 
                                        item.status === "Low Stock" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-red-100 text-red-800"
                                    }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <button
                                            onClick={() => {
                                                setEditingItem(item);
                                            }}
                                            className="text-indigo-600 hover:text-indigo-800"
                                        >
                                            <Pencil className="w-5 h-5"/>
                                        </button>
                                        <button
                                            onClick={() => setItems(items.filter((i) => i.id !== item.id))}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        
                    </tbody>
                </table>
            </div>

             {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button className="px-4 py-2 text-indigo-600 hover:text-indigo-800"> Previous </button>
                <button className="px-4 py-2 text-indigo-600 hover:text-indigo-800"> Next </button>
            </div>

            {/* Modal */}
            {(showModal || editingItem) && (
                <div className="fixed insert-0 z-10 overflow-y-auto bg-gray-900 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-xl w-full md:w-96">
                        <h2 className="text-lg font-semibold mb-4">
                            {editingItem ? "Edit Item" : "Add New Item"}
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700"> Item Name </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    required
                                    defaultValue={editingItem ?.name}
                                />
                            </div>
                            <div>
                                <label htmlFor="category" className="block text-sm font-semibold text-gray-700"> Category </label>
                                <select
                                    name="category"
                                    className="w-full p-2 border rounded-lg"
                                    defaultValue={editingItem ?.category}
                                >
                                    <option value="Electronics"> Electronics </option>
                                    <option value="Clothing"> Clothing </option>
                                    <option value="Food"> Food </option>
                                </select>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-500 text-white rounded-lg px-4 py-2 hover:bg-indigo-700"
                                > 
                                    {editingItem ? "Save Changes" : "Add Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


        </div>

            

    )
}