'use client';
import { useState, useEffect } from 'react';
import { Download, FileText, PieChart, BarChart, Calendar, Filter, Sliders, ClipboardList, AlertTriangle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";

interface StockData {
  id: number;
  name: string;
  category: { name: string };
  quantity: number;
  usage: number;
  status: string;
}

interface RequestData {
  id: number;
  user: { username: string };
  item: { name: string };
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('stock');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [reportData, setReportData] = useState<StockData[] | RequestData[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReportData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        type: reportType,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        category: categoryFilter
      });

      const response = await fetch(`${API_URL}/reports/?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${reportType} report`);
      }
      const data = await response.json();
      setReportData(data.data);
      setStats(data.stats);
    } catch (err: any) {
      setError(err.message || 'Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportType, startDate, endDate, categoryFilter]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const params = new URLSearchParams({
        format,
        type: reportType,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        category: categoryFilter
      });

      const response = await fetch(`${API_URL}/reports/export/?${params}`);
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }

      const contentDisposition = response.headers.get('content-disposition');
      let filename = `${reportType}_report.${format}`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      
      setError(`Successfully exported ${reportType} report as ${format.toUpperCase()}`);
      setTimeout(() => setError(null), 5000);
    } catch (error) {
      console.error('Export error:', error);
      setError(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTimeout(() => setError(null), 5000);
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Analytics Reports</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleExport('pdf')}
            className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Download className="w-5 h-5 mr-2" />
            Export PDF
          </button>
          <button 
            onClick={() => handleExport('excel')}
            className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            <Download className="w-5 h-5 mr-2" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Sliders className="w-5 h-5 text-gray-600" />
          <select 
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full bg-transparent outline-none"
            disabled={loading}
          >
            <option value="stock">Stock Report</option>
            <option value="requests">Requests Report</option>
            <option value="movement">Movement Report</option>
            <option value="teacher">Teacher Report</option>
          </select>
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Calendar className="w-5 h-5 text-gray-600" />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-transparent outline-none"
            disabled={loading}
          />
        </div>

        <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-transparent outline-none"
            disabled={loading}
          >
            <option value="all">All Categories</option>
            <option value="Stationery">Stationery</option>
            <option value="Equipment">Equipment</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
      </div>

      {/* Error/Success Display */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
          error.includes('failed') ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'
        }`}>
          <AlertTriangle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">
                    {reportType === 'stock' ? 'Total Items' : 
                     reportType === 'requests' ? 'Total Requests' : 
                     reportType === 'movement' ? 'Total Movements' : 'Total Teachers'}
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.total_items || stats.total_requests || stats.total_movements || stats.total_teachers || 0}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-indigo-600 bg-indigo-50 p-2 rounded-lg" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">
                    {reportType === 'stock' ? 'Low Stock Items' : 
                     reportType === 'requests' ? 'Approved Requests' : 
                     reportType === 'movement' ? 'Stock In' : 'Approved Requests'}
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.low_stock_items || stats.approved_requests || stats.stock_in || 0}
                  </p>
                </div>
                <ClipboardList className="w-10 h-10 text-green-600 bg-green-50 p-2 rounded-lg" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm mb-2">
                    {reportType === 'stock' ? 'Out of Stock' : 
                     reportType === 'requests' ? 'Pending Requests' : 
                     reportType === 'movement' ? 'Stock Out' : 'Total Items'}
                  </h3>
                  <p className="text-3xl font-bold text-gray-800">
                    {stats.out_of_stock_items || stats.pending_requests || stats.stock_out || 0}
                  </p>
                </div>
                <AlertTriangle className="w-10 h-10 text-red-600 bg-red-50 p-2 rounded-lg" />
              </div>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                {reportType === 'stock' ? 'Stock Distribution' : 
                 reportType === 'requests' ? 'Request Status' : 
                 reportType === 'movement' ? 'Movement Distribution' : 'Teacher Activity'}
              </h3>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <PieChart className="w-16 h-16 text-gray-400" />
                <span className="text-gray-400 ml-2">Chart Preview</span>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-4">
                {reportType === 'stock' ? 'Usage Trends' : 
                 reportType === 'requests' ? 'Request Trends' : 
                 reportType === 'movement' ? 'Movement Trends' : 'Request Patterns'}
              </h3>
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
                      <th className="px-6 py-4 text-left">Quantity</th>
                      <th className="px-6 py-4 text-left">Usage</th>
                      <th className="px-6 py-4 text-left">Status</th>
                    </>
                  ) : reportType === 'requests' ? (
                    <>
                      <th className="px-6 py-4 text-left">Teacher</th>
                      <th className="px-6 py-4 text-left">Item</th>
                      <th className="px-6 py-4 text-left">Status</th>
                      <th className="px-6 py-4 text-left">Date</th>
                    </>
                  ) : reportType === 'movement' ? (
                    <>
                      <th className="px-6 py-4 text-left">Date</th>
                      <th className="px-6 py-4 text-left">Item</th>
                      <th className="px-6 py-4 text-left">Change</th>
                      <th className="px-6 py-4 text-left">New Quantity</th>
                      <th className="px-6 py-4 text-left">Changed By</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-left">Teacher</th>
                      <th className="px-6 py-4 text-left">Total Requests</th>
                      <th className="px-6 py-4 text-left">Approved</th>
                      <th className="px-6 py-4 text-left">Categories Used</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.length > 0 ? (
                  reportData.map((item: any) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {reportType === 'stock' ? (
                        <>
                          <td className="px-6 py-4">{item.name}</td>
                          <td className="px-6 py-4">{item.category.name}</td>
                          <td className="px-6 py-4">{item.quantity}</td>
                          <td className="px-6 py-4 text-red-600">{item.usage}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                              item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status.replace('_', ' ')}
                            </span>
                          </td>
                        </>
                      ) : reportType === 'requests' ? (
                        <>
                          <td className="px-6 py-4">{item.user.username}</td>
                          <td className="px-6 py-4">{item.item.name}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-sm ${
                              item.status === 'approved' ? 'bg-green-100 text-green-800' :
                              item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                        </>
                      ) : reportType === 'movement' ? (
                        <>
                          <td className="px-6 py-4">{new Date(item.timestamp).toLocaleDateString()}</td>
                          <td className="px-6 py-4">{item.item__name}</td>
                          <td className="px-6 py-4">{item.change}</td>
                          <td className="px-6 py-4">{item.quantity_after_change}</td>
                          <td className="px-6 py-4">{item.changed_by__username || 'System'}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-4">{item.user__username}</td>
                          <td className="px-6 py-4">{item.total_requests}</td>
                          <td className="px-6 py-4">{item.approved_requests}</td>
                          <td className="px-6 py-4">{item.categories_used}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={reportType === 'movement' ? 5 : 4} className="px-6 py-4 text-center text-gray-500">
                      No data available
                    </td>
                  </tr>
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
                <span className="text-gray-800">{reportData.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Report Type:</span>
                <span className="text-gray-800 capitalize">{reportType} report</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

