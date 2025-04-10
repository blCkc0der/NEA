'use client';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface LogOutButtonProps {
    isCollapsed: boolean;
}   

export default function LogoutButton({ isCollapsed }: LogOutButtonProps) {
    const router = useRouter();
    const [ isMounted, setIsMouted ] = useState(false);

    useEffect(() => {
        setIsMouted(true);
    }, []);

    const handleLogout = () => {
        if (!isMounted) return;

        const confirmLogout = confirm('Are you sure you want to logout?');

        if (confirmLogout) {
            localStorage.removeItem('token');
            localStorage.clear();
            sessionStorage.clear();
            router.push('/login');   
        }
    };

    if (!isMounted) return null;

    return (
        <button 
            onClick={handleLogout}
            className={`flex items-center p-3 rounded-lg text-grey-600 hover:bg-grey-100 transition-colors
                ${isCollapsed 
                    ? 'justify-centre'
                    : 'space-x-3'

                }`}
        >
            <span className="w-5 h-5">
                <LogOut className="w-5 h-5" />
            </span>
            {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
    );
};
