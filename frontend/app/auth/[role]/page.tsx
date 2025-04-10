'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Users, Warehouse, GraduationCap } from 'lucide-react';
import { JSX, useState } from 'react';

interface RoleConfig {
  icon: JSX.Element;
  title: string;
}

// Define role-specific configurations
const roleConfig: Record<string, RoleConfig> = {
  admin: {
    icon: <Users className="w-8 h-8 text-indigo-600" />,
    title: 'Admin Access',
  },
  stock_manager: {
    icon: <Warehouse className="w-8 h-8 text-indigo-600" />,
    title: 'Stock Manager Sign In',
  },
  teacher: {
    icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
    title: 'Teacher Sign In / Sign Up',
  },
};

// Define role-to-dashboard URL mappings (for reference, but we'll use backend role)
const roleRedirects: Record<string, string> = {
  admin: '/adminDashboard',
  stock_manager: '/stockDashboard',
  teacher: '/teacherDashboard',
};

export default function AuthPage() {
  const params = useParams();
  const router = useRouter();
  const role = params.role as string;

  // Get role-specific configuration or default values
  const { icon, title } = roleConfig[role] || { icon: null, title: 'Sign In / Sign Up' };

  // API URL from environment variable or default
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

  // State for form data and error handling
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: role, // Pass the role to the backend for validation
        }),
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to log in');
        } else {
          const text = await response.text();
          throw new Error(`Unexpected response: ${text}`);
        }
      }

      // Parse the response
      const data = await response.json();

      // Save tokens (access token as 'token' to match RequestsPage)
      localStorage.setItem('token', data.tokens.access);
      localStorage.setItem('refresh_token', data.tokens.refresh); // Optional: keep for refresh
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('Access token stored:', data.tokens.access); // Debug

      // Clear form and error
      setFormData({
        email: '',
        password: '',
      });
      setError(null);

      // Redirect based on the user's role from the backend response
      const userRole = data.user.role;
      if (userRole === 'stock_manager') {
        router.push('/stockDashboard');
      } else if (userRole === 'teacher') {
        router.push('/teacherDashboard');
      } else if (userRole === 'admin') {
        router.push('/adminDashboard');
      } else {
        throw new Error('Invalid role returned from server');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError(error instanceof Error ? error.message : 'An error occurred during login');
    }
  };

  // Handle invalid roles
  if (!roleConfig[role]) {
    router.replace('/auth');
    return null;
  }

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
              href="http://127.0.0.1:8000/admin/"
              className="mt-4 inline-block py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Go to Admin Interface
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 mt-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
            >
              Sign In
            </button>

            {role !== 'stock_manager' && (
              <p className="text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href={`/auth/${role}/signup`} className="text-indigo-600 hover:underline">
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