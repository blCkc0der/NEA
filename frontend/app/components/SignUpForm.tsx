'use client';

import {useState} from "react";

interface SignUpFormProps {
    role: string;
    onSuccessfulSignUp: () => void;
}

export const SignUpForm = ({role, onSuccessfulSignUp}: SignUpFormProps) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });

    interface ChangeEvent {
        target: {
            id: string;
            value: string
        }
    };

    const handleChange = (e: ChangeEvent) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        console.log('Form submitted', formData);
        onSuccessfulSignUp?.(); // Call the onSuccessfulSignUp function 
    };
//p-4
    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    {/* Update the Form title */}
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Create {role.charAt(0).toUpperCase() + role.slice(1)} Account
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Rest of the form remains the same... */}
                        <div>
                            <label htmlFor="firstname" className="block text-sm font-medium text-gray-600">
                                First Name
                            </label>
                            <input 
                                type="text"
                                id="name"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outine-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your first name"
                                />
                        </div>
                        <div>
                            <label htmlFor="lastname" className="block text-sm font-medium text-gray-600">
                                Last Name
                            </label>
                            <input 
                                type="text"
                                id="name"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outine-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your last name"
                                />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
                                Email address
                            </label>
                            <input 
                                type="text"
                                id="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outine-none focus:ring-indigo-500 focus:border-indigo-500 focus:border-transparent"
                                placeholder="Enter your email address"
                                />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                                Password
                            </label>
                            <input 
                                type="text"
                                id="name"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outine-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Enter your password"
                                />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-600">
                                Confirm Password
                            </label>
                            <input 
                                type="text"
                                id="name"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full p-2 mt-1 border border-gray-300 rounded-md focus:outine-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Confirm your password"
                                />
                        </div>
                        <button
                            type="submit"
                            className="w-full p-2 mt-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                                Sign Up
                        </button>
                    </form>
                </div>
            </div>
        </div>
        )
}