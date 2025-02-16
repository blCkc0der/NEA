import React from 'react';
import RoleButton from '../components/rolebutton';


export default function AuthPage() {
    return (
      <div className="flex flex-col items-center p-6">
            <h1 className="text-3xl font-bold text-gray-800 sm:text-5xl mb-8">Select Your Role</h1> 
            <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3 w-full">
                <RoleButton role="admin" title="Admin" />
                <RoleButton role="stock-manager" title="Stock Manager" />
                <RoleButton role="teacher" title="Teacher" />
            </div>
        </div>
    );
}

