'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Type Definitions
interface ClassTaught {
  id: string;
  name: string;
  grade_level: string;
}

interface Subject {
  id: string;
  name: string;
}

interface ClassSubject {
  id: string;
  class_taught: ClassTaught;
  subject: Subject;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface TeacherProfile {
  id: string;
  bio: string;
  user: User;
  class_subjects: ClassSubject[];
}

interface Class {
  id: string;
  name: string;
  grade_level: string;
}

interface ApiError extends Error {
  status?: number;
}

// API Base URL from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Auth Service
class AuthService {
  static getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  static clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  }

  static setAuthTokens(token: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  static async refreshAuthToken(): Promise<string> {
    const refreshToken = AuthService.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      AuthService.clearAuthTokens();
      throw new Error('Failed to refresh token');
    }

    const data: { access: string } = await response.json();
    if (!data.access) {
      AuthService.clearAuthTokens();
      throw new Error('No access token in response');
    }

    AuthService.setAuthTokens(data.access, refreshToken);
    return data.access;
  }

  static async authFetch(
    input: RequestInfo,
    init?: RequestInit,
    router?: any
  ): Promise<Response> {
    let token = AuthService.getAuthToken();
    if (!token) {
      if (router) router.push('/login');
      throw new Error('No authentication token found');
    }

    const headers = {
      ...init?.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    let response = await fetch(input, {
      ...init,
      headers,
      // Removed credentials: 'include' to simplify CORS
    });

    if (response.status === 401) {
      try {
        const newToken = await AuthService.refreshAuthToken();
        response = await fetch(input, {
          ...init,
          headers: {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } catch (error) {
        AuthService.clearAuthTokens();
        if (router) router.push('/login');
        throw error instanceof Error
          ? error
          : new Error('Authentication refresh failed');
      }
    }

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        AuthService.clearAuthTokens();
        if (router) router.push('/login');
        throw new Error('Session expired or unauthorized');
      }
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  }
}

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    firstName: '',
    lastName: '',
    email: '',
  });
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [newClassSubject, setNewClassSubject] = useState({
    classId: '',
    subjectId: '',
  });
  const [loading, setLoading] = useState({
    profile: true,
    classes: true,
    subjects: true,
    saving: false,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, classesRes, subjectsRes] = await Promise.all([
          AuthService.authFetch(`${API_URL}/users/teachers/profile/`, {}, router),
          AuthService.authFetch(`${API_URL}/users/classes/`, {}, router),
          AuthService.authFetch(`${API_URL}/users/subjects/`, {}, router),
        ]);

        const [profileData, classesData, subjectsData] = await Promise.all([
          profileRes.json() as Promise<TeacherProfile>,
          classesRes.json() as Promise<Class[]>,
          subjectsRes.json() as Promise<Subject[]>,
        ]);

        setProfile(profileData);
        setFormData({
          bio: profileData.bio || '',
          firstName: profileData.user.first_name || '',
          lastName: profileData.user.last_name || '',
          email: profileData.user.email || '',
        });
        setAvailableClasses(classesData);
        setAvailableSubjects(subjectsData);
      } catch (err) {
        const error = err as ApiError;
        setError(error.message || 'Failed to load profile data');
      } finally {
        setLoading({
          profile: false,
          classes: false,
          subjects: false,
          saving: false,
        });
      }
    };

    fetchData();
  }, [router]);

  const handleUpdateProfile = async () => {
    setLoading((prev) => ({ ...prev, saving: true }));
    setError(null);

    try {
      const response = await AuthService.authFetch(
        `${API_URL}/users/teachers/profile/`,
        {
          method: 'PUT',
          body: JSON.stringify({
            bio: formData.bio,
            first_name: formData.firstName,
            last_name: formData.lastName,
          }),
        },
        router
      );

      const updatedProfile: TeacherProfile = await response.json();
      setProfile(updatedProfile);
      setEditing(false);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to update profile');
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleAddClassSubject = async () => {
    if (!newClassSubject.classId || !newClassSubject.subjectId) {
      setError('Please select both a class and a subject');
      return;
    }

    setLoading((prev) => ({ ...prev, saving: true }));
    setError(null);

    try {
      const response = await AuthService.authFetch(
        `${API_URL}/users/teachers/classes/`,
        {
          method: 'POST',
          body: JSON.stringify({
            class_taught_id: newClassSubject.classId,
            subject_id: newClassSubject.subjectId,
          }),
        },
        router
      );

      const updated: ClassSubject = await response.json();
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              class_subjects: [...prev.class_subjects, updated],
            }
          : null
      );
      setNewClassSubject({ classId: '', subjectId: '' });
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to add class/subject');
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  const handleRemoveClassSubject = async (id: string) => {
    if (!confirm('Are you sure you want to remove this class/subject?')) return;

    setLoading((prev) => ({ ...prev, saving: true }));
    setError(null);

    try {
      await AuthService.authFetch(
        `${API_URL}/users/teachers/classes/${id}/`,
        {
          method: 'DELETE',
        },
        router
      );

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              class_subjects: prev.class_subjects.filter((cs) => cs.id !== id),
            }
          : null
      );
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'Failed to remove class/subject');
    } finally {
      setLoading((prev) => ({ ...prev, saving: false }));
    }
  };

  if (loading.profile) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center py-8">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {profile.user.first_name} {profile.user.last_name}&apos;s Profile
          </h1>
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
            disabled={loading.saving}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading.saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading.saving}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  disabled={loading.saving}
                />
              </div>
              <div className="md:col-span-2 flex justify-end space-x-4">
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                  disabled={loading.saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={loading.saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  {loading.saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  About
                </h2>
                <p className="text-gray-600 whitespace-pre-line">
                  {profile.bio || 'No bio provided'}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                  Contact
                </h2>
                <p className="text-gray-600">{profile.user.email}</p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Classes & Subjects
            </h2>

            {profile.class_subjects.length > 0 ? (
              <div className="space-y-4">
                {profile.class_subjects.map((cs) => (
                  <div
                    key={cs.id}
                    className="flex justify-between items-center bg-gray-50 p-4 rounded-md"
                  >
                    <div>
                      <span className="font-medium">{cs.class_taught.name}</span>{' '}
                      - {cs.subject.name}
                      <span className="text-sm text-gray-500 ml-2">
                        (Grade {cs.class_taught.grade_level})
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveClassSubject(cs.id)}
                      className="text-red-600 hover:text-red-800"
                      disabled={loading.saving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No classes assigned yet</p>
            )}

            <div className="mt-6 bg-gray-50 p-4 rounded-md">
              <h3 className="font-medium text-gray-700 mb-3">
                Add New Class/Subject
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={newClassSubject.classId}
                    onChange={(e) =>
                      setNewClassSubject({
                        ...newClassSubject,
                        classId: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={loading.classes || loading.saving}
                  >
                    <option value="">Select a class</option>
                    {availableClasses.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} (Grade {cls.grade_level})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={newClassSubject.subjectId}
                    onChange={(e) =>
                      setNewClassSubject({
                        ...newClassSubject,
                        subjectId: e.target.value,
                      })
                    }
                    className="w-full p-2 border border-gray-300 rounded-md"
                    disabled={loading.subjects || loading.saving}
                  >
                    <option value="">Select a subject</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddClassSubject}
                disabled={
                  !newClassSubject.classId ||
                  !newClassSubject.subjectId ||
                  loading.saving
                }
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading.saving ? 'Adding...' : 'Add Class/Subject'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}