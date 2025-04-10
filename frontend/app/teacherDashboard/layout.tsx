'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Box, Bell, ClipboardList, User, BarChart } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import LogoutButton from '../components/LogOutButton/LogOutButton';

// Define the props interface for type safety
const NavItem = ({ 
  title, 
  icon, 
  href,
  isCollapsed // Add isCollapsed to NavItem props
}: { 
  title: string; 
  icon: React.ReactNode;
  href: string;
  isCollapsed: boolean;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center p-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-50 text-indigo-600' 
          : 'text-gray-600 hover:bg-gray-100'
      } ${isCollapsed ? 'justify-center' : 'space-x-3'}`}
    >
      <span className="w-5 h-5">{icon}</span>
      {!isCollapsed && <span className="font-medium">{title}</span>}
    </Link>
  );
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Auto-collapse on small screens
  useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggle = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Teacher Sidebar */}
      <nav className={`bg-white border-r border-gray-200 p-4 fixed h-full transition-all ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="mb-8 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2 text-blue-600 font-bold text-xl">
              <span>SIMS</span>
            </div>
          )}
          <button onClick={handleToggle} className="text-gray-600">
            ☰
          </button>
        </div>

        <div className="space-y-2">
          <NavItem 
            title="Dashboard" 
            icon={<Home className="w-5 h-5" />} 
            href="/teacherDashboard"
            isCollapsed={isCollapsed}
          />
          <NavItem
            title="My Inventory"
            icon={<Box className="w-5 h-5" />}
            href="/teacherDashboard/inventory"
            isCollapsed={isCollapsed}
          />
          <NavItem
            title="Requests"
            icon={<ClipboardList className="w-5 h-5" />}
            href="/teacherDashboard/requests"
            isCollapsed={isCollapsed}
          />
          <NavItem
            title="Reports"
            icon={<BarChart className="w-5 h-5" />}
            href="/teacherDashboard/reports"
            isCollapsed={isCollapsed}
          />
          <NavItem
            title="Notifications"
            icon={<Bell className="w-5 h-5" />}
            href="/teacherDashboard/notifications"
            isCollapsed={isCollapsed}
          />
          <NavItem
            title="Profile"
            icon={<User className="w-5 h-5" />}
            href="/teacherDashboard/profile"
            isCollapsed={isCollapsed}
          />

          {/* Logout */}
          <div className="mt-auto pt-4 border-t border-gray-200">

            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`flex-1 p-8 transition-all ${isCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Welcome to SIMS
          </h1>
          <div className="flex items-center space-x-4">
            <Link 
              href="/teacherDashboard/notifications"
              className="text-gray-600 hover:text-indigo-600 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                3
              </span>
            </Link>
            <Link
              href="/profile"
              className="text-gray-600 hover:text-indigo-600"
            >
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}