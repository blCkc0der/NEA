'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ClassSubject {
  classId: string;
  subjectId: string;
}

type RoleType = 'teacher' | 'stock_manager' | 'admin';

interface SignUpFormProps {
  role: RoleType;
  onSuccessfulSignUp?: () => void;
}

export const SignUpForm = ({ onSuccessfulSignUp }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    bio: '',
    
  });

// API URL from environment variable or default
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [currentClass, setCurrentClass] = useState('');
  const [currentSubject, setCurrentSubject] = useState('');
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch available classes and subjects on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoadingClasses(true);
        setLoadingSubjects(true);
        
        const [classesRes, subjectsRes] = await Promise.all([
          fetch(`${API_URL}/users/classes`),
          fetch(`${API_URL}/users/subjects`),
        ]);

        if (!classesRes.ok || !subjectsRes.ok) {
          throw new Error('Failed to fetch initial data');
        }

        const [classesData, subjectsData] = await Promise.all([
          classesRes.json(),
          subjectsRes.json()
        ]);

        setAvailableClasses(classesData);
        setAvailableSubjects(subjectsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes and subjects');
      } finally {
        setLoadingClasses(false);
        setLoadingSubjects(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleAddClassSubject = () => {
    if (!currentClass || !currentSubject) {
      setError('Please select both a class and a subject');
      return;
    }

    // Check if this combination already exists
    if (classSubjects.some(
      cs => cs.classId === currentClass && cs.subjectId === currentSubject
    )) {
      setError('This class-subject combination already exists');
      return;
    }

    setClassSubjects([...classSubjects, {
      classId: currentClass,
      subjectId: currentSubject
    }]);
    
    // Reset selections
    setCurrentClass('');
    setCurrentSubject('');
    setError(null);
  };

  const handleRemoveClassSubject = (index: number) => {
    const updated = [...classSubjects];
    updated.splice(index, 1);
    setClassSubjects(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate at least one class-subject for teachers
    if (classSubjects.length === 0) {
      setError('Please add at least one class and subject you teach');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          classSubjects,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to sign up');
      }

      const data = await response.json();
      localStorage.setItem('token', data.tokens.access);

      // Clear form
      setFormData({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        bio: '',
      });
      setClassSubjects([]);
      setError(null);

      // Call callback or redirect
      if (onSuccessfulSignUp) {
        onSuccessfulSignUp();
      } else {
        router.push('/teacher/teacherDashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during signup');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Teacher Sign Up
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your teacher account
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Classes and Subjects
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="class" className="block text-sm font-medium text-gray-700">
                      Class
                    </label>
                    <select
                      id="class"
                      value={currentClass}
                      onChange={(e) => setCurrentClass(e.target.value)}
                      disabled={loadingClasses}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a class</option>
                      {availableClasses.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.name} (Grade {cls.grade_level})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <select
                      id="subject"
                      value={currentSubject}
                      onChange={(e) => setCurrentSubject(e.target.value)}
                      disabled={loadingSubjects}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    >
                      <option value="">Select a subject</option>
                      {availableSubjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddClassSubject}
                  disabled={!currentClass || !currentSubject}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Add Class-Subject
                </button>

                {classSubjects.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                      Selected Class-Subject Combinations:
                    </h4>
                    <ul className="divide-y divide-gray-200">
                      {classSubjects.map((cs, index) => {
                        const cls = availableClasses.find(c => c.id === cs.classId);
                        const subject = availableSubjects.find(s => s.id === cs.subjectId);
                        
                        return (
                          <li key={`${cs.classId}-${cs.subjectId}`} className="py-2 flex justify-between items-center">
                            <span>
                              <span className="font-medium">{cls?.name}</span> - {subject?.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveClassSubject(index)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Remove
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};