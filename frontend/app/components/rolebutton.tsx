import React from "react";
import Link from "next/link";
import {Users, Warehouse, GraduationCap, User} from 'lucide-react';

interface RoleButtonProps {
    role: 'admin' | 'stock-manager' | 'teacher';
    title: string;
}

const icons = {
    admin: Users,
    'stock-manager': Warehouse,
    teacher: GraduationCap
}

const RoleButton: React.FC<RoleButtonProps> = ({role, title}) => {
    const Icon = icons[role];
    return (
        <Link 
            href={`/auth/${role}`}
            className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 w-56 group">
            
            <div className="p-4 rounded-full bg-indigo-50 group-hover:bg-indigo-200 transition-all duration-300">
                <Icon className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-gray-800">{title}</h2>
            {/*<p className="mt-2 text-sm text-gray-60">Click to login or signup</p>*/}
        </Link>
    );
};

export default RoleButton;