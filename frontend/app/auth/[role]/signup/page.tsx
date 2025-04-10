'use client';
import { useParams, useRouter } from 'next/navigation';
import { SignUpForm } from '../../../components/SignUpForm/SignUpForm';
import { GraduationCap, Warehouse } from 'lucide-react';
import { JSX } from 'react';

const roleRedirects = {
  t: "/teacherDashboard",  // Redirect for role 't'
  s: "/stockDashboard",  // Redirect for role 's'
  a: "/adminDashboard",  // Redirect for role 'a'
};

type RoleType = 'teacher' | 'stock_manager';

const roleConfig = {
  teacher: {
    icon: <GraduationCap className="w-8 h-8 text-indigo-600" />,
    title: 'Teacher Sign Up',
  },
  'stock_manager': {
    icon: <Warehouse className="w-8 h-8 text-indigo-600" />,
    title: 'Stock Manager Sign Up',
  },
} satisfies Record<RoleType, { icon: JSX.Element; title: string }>;

export default function SignUpPage() {
  const router = useRouter();
  const params = useParams();
  const role = params.role as RoleType;

  // Handle invalid roles
  if (!(role in roleConfig)) {
    router.replace('/auth');
    return null;
  }

  const { icon, title } = roleConfig[role];

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="p-4 rounded-full bg-indigo-50">{icon}</div>
          <h1 className="mt-4 text-2xl font-semibold text-gray-800">{title}</h1>
        </div>
        
        <SignUpForm 
          role={role}
          onSuccessfulSignUp={() => {
            router.push(`/teacherDashboard`);
           //router.push(`/${role}/dashboard`);
          }}
        />
      </div>
    </div>
  );
}