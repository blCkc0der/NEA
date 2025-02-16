'use client';
import {Home, Box, Bell, ClipboardList, BarChart, User, LogOut, BookOpen, Settings, MessageSquare } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

// nav item component with active state
const NavItem = ({
    title, 
    icon, 
    href 
} : {
    title: string,
    icon: React.ReactNode,
    href: string,
}) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link 
            href= {href}
            className={`flex items-center space-x-3 p-3 rounded-lg transition-colors
                ${isActive 
                    ? 'bg-indigo-50 text-indigo-600-200' 
                    : 'text-gray-600 hover:bg-gray-100'}`}
        >

            
            {icon}
            <span className='font-medium'>{title}</span> 
        
        </Link>
    );
};

//Sidebar component
export default function Dashboardlayout({children}: {children: React.ReactNode}) {

    const router = useRouter();

    const handleLogout =  () => {
        // perform logout
        router.push('/login')
    }

    return (
        <div className='flex min-h-screen bg-gray-50'>
            {/*Navabar navigation*/}
            <nav className='w-64 bg-white border-r border-gray-200 fixed h-full'>
                <div className='mb-8'>
                    <div className='flox items-center space-x-2 text-indigo-600 font-medium'>
                        <span className=''> LOGO </span>
                    </div>
                    <div className='space-y-2'>
                        <NavItem
                            title='Dashboard'
                            icon = {<Home className='w-5 h-5'/>}
                            href='/teacherDashboard'
                        />
                        <NavItem
                            title='Inventory'
                            icon = {<Box className='w-5 h-5'/>}
                            href='/teacherDashboard/inventory'
                        />
                        <NavItem
                            title='My Requests'
                            icon = {<ClipboardList className='w-5 h-5'/>}
                            href='/teacherDashboard/myRequests'
                        />
                        <NavItem
                            title='Catalog'
                            icon = {<BookOpen className='w-5 h-5'/>}
                            href='/teacherDashboard/catalog'
                        />
                        <NavItem
                            title='Messages'
                            icon = {<BarChart className='w-5 h-5'/>}
                            href='/teacherDashboard/messages'
                        />
                        <NavItem
                            title='Notifications'
                            icon = {<Bell className='w-5 h-5'/>}
                            href='/teacherDashboard/notifications'
                        />  
                        <NavItem
                            title='Settings'
                            icon = {<Settings className='w-5 h-5'/>}
                            href='/teacherDashboard/settings'
                        />  

                        {/*Logout button*/}
                        <div className='mt-auto pt-4 border-t border-gray-200'>
                            <button
                                onClick={handleLogout}
                                className='flex items-center space-x-2 p-3 rounded-lg text-grey-60 hover:bg-grey-100'
                            >
                                <LogOut className='w-5 h-5'/>
                                <span className='font-medium'> LogOut</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main contents */}
            <main className='flex-1 p-8 ml-64'>
                {/* Top Mavigation */}
                <div className='flex items-center justify-between mb-8'>
                    <h1 className='text-2xl font-bold text-gray-800'> DASHBOARD</h1>
                    <div className='flex items-center space-x-4'>
                        <button>
                            <User className='w-5 h-5'/>
                        </button>
                    </div>
                </div>
                {children}
            </main>
        </div>

    );
};
