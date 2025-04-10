import React from 'react';
import RoleButton from '../components/RoleButton/rolebutton';

// Imports a reusable component that renders a styled button based on user role selection.
// HCI (Human-Computer Interaction): This promotes consistency in design and reuse of UI logic.


export default function Login() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
          {/* Main page container with vertical centering using Tailwind utility classes */}

          <h1 className="text-3xl font-bold text-gray-800 mb-8">
            Select Your Role
          </h1>
           {/* Responsive layout for role selection buttons using Tailwind CSS 
          HCI: Responsive UI supports various screen sizes (Web client UX design)
        */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-6 justify-center items-center">
            {/* Button navigates to respective user login page */}
            <RoleButton role="admin" title="Admin" />
            <RoleButton role="stock_manager" title="Stock Manager" />
            <RoleButton role="teacher" title="Teacher" />
          </div>
        </div>
      );
    };