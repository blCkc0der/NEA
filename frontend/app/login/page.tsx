import React from 'react';
import RoleButton from '../components/RoleButton/rolebutton';

export default function Login() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Select Your Role
          </h1>
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
            <RoleButton role="admin" title="Admin" />
            <RoleButton role="stock_manager" title="Stock Manager" />
            <RoleButton role="teacher" title="Teacher" />
          </div>
        </div>
      );
    };