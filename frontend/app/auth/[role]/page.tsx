'use client';

import { useParams } from 'next/navigation';
import { JSX } from 'react';
import { Users, Warehouse, GraduationCap } from 'lucide-react';
import Link from 'next/link';


interface RoleConfig {
  icon: JSX.Element;
  title: string;
}

const roleConfig: Record<string, RoleConfig> = {
  admin: {
    icon: <Users className="w-8 h-8 text-indigo-600" />,
    title: 'Admin Access',
  },
  'stock-manager': {
    icon: <Warehouse className="w-8 h-8 text-indigo-600" />,
    title: 'Stock Manager Sign In',
  },
  teacher: {
    icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
    title: 'Teacher Sign In / Sign Up',
  },
};

export default function AuthPage() {
  const params = useParams();
  const role = params.role as string;

  const { icon, title } = roleConfig[role] || {
    icon: null,
    title: 'Sign In / Sign Up',
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center">
          <div className="p-4 rounded-full bg-indigo-50">{icon}</div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h1>
        </div>

        {role === 'admin' ? (
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Admins must sign in via the Django superuser interface.
            </p>
            <a
              href="/admin"
              className="mt-4 inline-block py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Go to Admin Interface
            </a>
          </div>
        ) : (
          <form className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Sign In
            </button>

            {role !== 'stock-manager' && (
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link 
                  href= {`/auth/${role}/signup` }
                  className="text-indigo-600 hover:underline cursor-pointer">
                Sign Up
                </Link>
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}