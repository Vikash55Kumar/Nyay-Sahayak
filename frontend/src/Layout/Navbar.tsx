import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png'; 

// --- SVG Icon for Logout ---
const LogoutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const Header = () => {
    // 1. User data is stored in a const object
    const currentUser = {
        name: "Priya Sharma",
    };

    // 2. State to manage dropdown visibility
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Effect to handle clicks outside the dropdown to close it
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <header className="bg-white shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-4">
                        {/* Logo Placeholder */}
                        <Link to="/dashboard">
                            <div className="flex-shrink-0 w-13 h-13 rounded-full">
                                <img src={logo} alt="Logo" className="h-12 w-12" />
                            </div>
                        </Link>
                    </div>

                    {/* Navigation Links */}
                    <nav className="hidden md:flex space-x-8">
                        <Link to="/dashboard" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">Dashboard</Link>
                        <Link to="/about" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">About</Link>
                        <Link to="/help" className="font-medium text-gray-600 hover:text-blue-600 transition-colors">Help Center</Link>
                    </nav>

                    {/* Profile Section with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div className="flex items-center cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                            <span className="text-sm font-medium text-gray-600 mr-3 hidden sm:block">
                                Welcome, {currentUser.name}
                            </span>
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div 
                                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 transition ease-out duration-100"
                                style={{ transform: 'translateY(0)', opacity: 1 }}
                            >
                                <a
                                    href="#"
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogoutIcon />
                                    <span className='text-red-500'>Logout</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;