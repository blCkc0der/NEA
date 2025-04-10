'use client';
import { useState } from 'react';
import { Download, FileText, PieChart, BarChart, Calendar, Filter, Sliders,ClipboardList, AlertTriangle } from 'lucide-react';
import { StockData, RequestData } from '@/app/lib/type';
import { mockStockData, mockRequestData } from '@/app/lib/data';



export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('stock');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleExport = (format: string) => {
    console.log(`Exporting ${format} report for ${reportType}`);
    // Add actual export logic here
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Reports</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleExport('pdf')}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Sliders className="w-5 h-5 text-gray-600" />
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-transparent outline-none"
          >
            <option value="stock">Stock Report</option>
            <option value="requests">Request Report</option>
            <option value="both">Combined Report</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent outline-none"
          >
            <option value="all">All Categories</option>
            <option value="Stationery">Stationery</option>
            <option value="Equipment">Equipment</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm mb-2">Total Items Tracked</h3>
              <p className="text-3xl font-bold text-gray-800">1,234</p>
            </div>
            <FileText className="w-10 h-10 text-indigo-600 bg-indigo-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm mb-2">Requests This Month</h3>
              <p className="text-3xl font-bold text-gray-800">89</p>
            </div>
            <ClipboardList className="w-10 h-10 text-green-600 bg-green-50 p-2 rounded-lg" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-gray-500 text-sm mb-2">Low Stock Items</h3>
              <p className="text-3xl font-bold text-gray-800">15</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-600 bg-red-50 p-2 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Stock Movement Trends</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <PieChart className="w-16 h-16 text-gray-400" />
            <span className="text-gray-400 ml-2">Chart Preview</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Request Statistics</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
            <BarChart className="w-16 h-16 text-gray-400" />
            <span className="text-gray-400 ml-2">Chart Preview</span>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {reportType === 'stock' ? (
                <>
                  <th className="px-6 py-4 text-left">Item</th>
                  <th className="px-6 py-4 text-left">Category</th>
                  <th className="px-6 py-4 text-left">Start Stock</th>
                  <th className="px-6 py-4 text-left">End Stock</th>
                  <th className="px-6 py-4 text-left">Usage</th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-left">Teacher</th>
                  <th className="px-6 py-4 text-left">Item</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Date</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reportType === 'stock' ? (
                mockStockData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{item.item}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.startStock}</td>
                    <td className="px-6 py-4">{item.endStock}</td>
                    <td className="px-6 py-4 text-red-600">{item.usage}</td>
                </tr>
                ))
                ) : (
                mockRequestData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">{item.teacher}</td>
                    <td className="px-6 py-4">{item.item}</td>
                    <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                        item.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        item.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {item.status}
                    </span>
                    </td>
                    <td className="px-6 py-4">{item.date}</td>
                </tr>
                ))
            )}
        </tbody>
        </table>
      </div>

      {/* Report Summary */}
      <div className="mt-6 bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Report Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Date Range:</span>
            <span className="text-gray-800">{startDate || 'N/A'} to {endDate || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Generated On:</span>
            <span className="text-gray-800">{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Records:</span>
            <span className="text-gray-800">{(reportType === 'stock' ? mockStockData : mockRequestData).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Report Type:</span>
            <span className="text-gray-800 capitalize">{reportType} report</span>
          </div>
        </div>
      </div>
    </div>
  );
}