'use client';

import { Search, ClipboardList, History, SquarePlus, FileText, Bell} from "lucide-react";

const notifications = [
    {id: 1, message: "Your request #123 has been approved", time: "2hrs ago"},
    {id: 2, message: "New stationery items available", time: "1 day ago"},
]
export default function DashboardPage() {
    
    return (
        <>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center bg-white rounded-lg px-4 py-2 shadow-sm w-full md:w -96">
                <Search className="w-5 h-5 text-gray-400"/>
                <input 
                    type = "text"
                    placeholder="Search"
                    className="w-full px-2 bg-transparent focus:outline-none"
                /> 
            </div>
        </div>

        {/* Stock level grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <button>
                        <p className="font-semibold"> Submit Request </p>
                        <h2 className="text-sm text-gray-500"> Create new stationery request </h2>
                    </button>
                    <SquarePlus className="w-10 h-10 text-gray-500"/>
                </div>
            </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold"> Request Overview</p>
                        <h2 className="text-sm text-gray-500"> 3 Active Request </h2>
                    </div>
                    <ClipboardList className="w-10 h-10 text-gray-500"/>
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold"> Request History</p>
                        <h2 className="text-sm text-gray-500"> View past Requests </h2>
                    </div>
                    <History className="w-10 h-10 text-gray-500"/>
                </div>
            </div>
        </div>

        {/*Inventory Table*/}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4"> Recent Request </h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((item => 
                        <div key={item} className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                        <div className="bg-gray-100 p-2 rounded">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800">Request #{item + 100}</h3>
                          <p className="text-sm text-gray-600">Submitted on March {item + 10}, 2024</p>
                        </div>
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm ${
                          item === 1 ? 'bg-green-100 text-green-800' : 
                          item === 2 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {item === 1 ? 'Approved' : item === 2 ? 'Pending' : 'In Review'}
                        </span>
                      </div>
                    ))}
                </div>    
        </div>

        {/* Request Table section */}
        <div className="bg-white rounded-x p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Notification</h2>
            <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="bg-indigo-100 p-2 rounded">
                      <Bell className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-gray-800">{notification.message}</p>
                      <span className="text-sm text-gray-500">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
        </div>
        </>
    );
}