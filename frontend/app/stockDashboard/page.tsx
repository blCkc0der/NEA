'use client';

import { Search, Box, AlertTriangle, ClipboardList, SquarePlus } from "lucide-react";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import { useRouter } from "next/navigation";

const monthyUsageData = [
    {month: "Jan", usage: 200}, 
    {month: "Feb", usage: 1700}, 
    {month: "Mar", usage: 700}, 
    {month: "Apr", usage: 400}, 
    {month: "May", usage: 1000}, 
    {month: "June", usage: 60}, 
    {month: "July", usage: 1000}, 
    {month: "Aug", usage: 500}, 
    {month: "Sept", usage: 700}, 
    {month: "Oct", usage: 100}, 
    {month: "Nov", usage: 900}, 
    {month: "Dec", usage: 150}, 
]

const requestSummaryData = [
    {period: "Mon", approved: 10, rejected: 2, pending: 3},
    {period: "Tue", approved: 5, rejected: 5, pending: 1},
    {period: "Wed", approved: 6, rejected: 8, pending: 4},
    {period: "Thur", approved: 15, rejected: 2, pending: 6},
    {period: "Fri", approved: 10, rejected: 2, pending: 3},
]

export default function DashboardPage() {
    const router = useRouter();
    
    const handleStockLevels =  () => {
        // perform logout
        router.push('/')
    }

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

        {/*Stock level update*/}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <button
                    onClick={handleStockLevels}
                    className='flex items-center space-x-2 p-3 rounded-lg text-grey-60 hover:bg-grey-100'
                >
                    <Box className='w-5 h-5'/>
                    <span className='font-medium'> Set Stock Levels</span>
                </button>
            </div>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500"> Total Items</p>
                        <h2 className="text-2xl font-semibold"> 1,200 </h2>
                    </div>
                    <Box className="w-12 h-12 text-gray-500"/>
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500"> Pending Requests</p>
                        <h2 className="text-2xl font-semibold"> 1,200 </h2>
                    </div>
                    <ClipboardList className="w-12 h-12 text-gray-500"/>
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-500"> Low Stock</p>
                        <h2 className="text-2xl font-semibold"> 1,200 </h2>
                    </div>
                    <AlertTriangle className="w-12 h-12 text-gray-500"/>
                </div>
            </div>
        </div>

        {/*Chart section*/}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4"> Monthly Usage</h3> 
                <ResponsiveContainer width = "100%" height = {300}>
                    <BarChart data = {monthyUsageData}> 
                        <CartesianGrid strokeDasharray = "3 3"/>
                        <XAxis dataKey= "month"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey = "usage" fill="#3182CE"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
                <h3 className="text-lg font-semibold mb-4"> Request Summary </h3>
                {/*<div className="h-[300px]">*/}
                <ResponsiveContainer width = "100%" height = {300}>
                    <BarChart data = {requestSummaryData}> 
                        <CartesianGrid strokeDasharray = "3 3"/>
                        <XAxis dataKey= "period"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Bar dataKey="approved" fill="#22c55e" stackId="a" name="Approved"/>
                        <Bar dataKey="rejected" fill="#ef4444" stackId="a" name="Rejected"/>
                        <Bar dataKey="pending" fill="#facc15" stackId="a" name="Pending"/>
                    </BarChart>
                </ResponsiveContainer>
                {/*</div>*/}
            </div>
        </div>

        {/*Inventory Table*/}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h3 className="text-lg font-semibold mb-4"> Inventory Overview </h3>
            <table className="w-full">
                <thead>
                    <tr className="text-left text-gray-500 border-b">
                        <th className="text-left">Item</th>
                        <th className="text-left">Category</th>
                        <th className="text-left">Quantity</th>
                        <th className="text-left">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {[1, 2, 3, 4, 5].map((item, index) => {
                        const statusColors = {
                            'In Stock': 'bg-green-100 text-green-800',
                            'Low Stock': 'bg-yellow-100 text-yellow-800',
                            'Out of Stock': 'bg-red-100 text-red-800',
                        } as const;

                        // Get status diretly without intrmediate array
                        const status = [
                            'In Stock',
                            'Low Stock',
                            'Out of Stock',
                        ][index % 3] as keyof typeof statusColors;
                        
                        return(
                            <tr key={item} className="border-b last:border-b-0 hover:bg-gray-50">
                                <td className="py-4">Item {item}</td>
                                <td>Category {item} </td>
                                <td> {item * 100} </td>
                                <td>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[status]}`}>
                                        {status}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* Request Table section */}
        <div className="bg-white rounded-x p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Request Activities</h3>
            <ul className="space-y-4">
                {[
                    {id: 1, action: "Items restocked", time: "2h ago"},
                    {id: 2, action: "New request submitted", time: "4h ago"},
                    {id: 3, action: "Low stock alert", time: "2d ago"},
                    {id: 4, action: "Inventory report generated", time: "3d ago"},
                ].map((activity) => (
                    <li key= {activity.id} 
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div>
                            <span className="text-sm text-gray-500">{activity.action}</span>
                            <span className="text-sm text-gray-50">{activity.time}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
        </>
    );
}