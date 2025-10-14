import React, { useState, Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Transition } from '@headlessui/react';
import { Menu as MenuIcon, X, UserCircle, ChevronDown, LogOut, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
// --- Main Navbar Component ---

const Navbar: React.FC = () => {
    
    const { isAuthenticated, user, logout } = useAuth();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
    const [fontSize, setFontSize] = useState<'base' | 'lg' | 'xl'>('base');

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'About', href: '/about' },
        { name: 'Apply Scheme', href: '/dashboard' },
        { name: 'Contact Us', href: '/contact' },
    ];
    
    // Dynamically set font size class on the root element
    React.useEffect(() => {
        document.documentElement.className = `text-${fontSize}`;
    }, [fontSize]);

    return (
        <header className="backdrop-blur-lg bg-white/80 shadow-lg sticky top-0 z-50 border-b border-slate-200">
            {/* Top Bar for Accessibility and Language */}
            <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-800 text-white text-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-8">
                    <div className="flex items-center space-x-4">
                        <a href="#main-content" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white">Skip to Main Content</a>
                        <a href="/screen-reader-access" className="hover:underline focus:outline-none focus:ring-2 focus:ring-white">Screen Reader Access</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        {/* Font Size Controls */}
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setFontSize('base')} className={`px-1.5 rounded transition-all duration-150 ${fontSize === 'base' ? 'bg-white text-slate-800 shadow' : 'hover:bg-white/20'}`} aria-label="Default font size">A</button>
                            <button onClick={() => setFontSize('lg')} className={`px-1.5 rounded text-base transition-all duration-150 ${fontSize === 'lg' ? 'bg-white text-slate-800 shadow' : 'hover:bg-white/20'}`} aria-label="Large font size">A+</button>
                            <button onClick={() => setFontSize('xl')} className={`px-1.5 rounded text-lg transition-all duration-150 ${fontSize === 'xl' ? 'bg-white text-slate-800 shadow' : 'hover:bg-white/20'}`} aria-label="Extra large font size">A++</button>
                        </div>
                        {/* Language Switcher */}
                        <div>
                            <select className="bg-transparent border-none focus:ring-0 text-xs p-1 text-white">
                                <option value="en">English</option>
                                <option value="hi">हिन्दी</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Branding Section */}
                    <div className="flex items-center space-x-4">
                        <Link to="/" className="flex items-center space-x-4 group">
                            <img src={logo} alt="Nyay Sahayak Logo" className="h-16 w-[70px] drop-shadow-lg transition-transform group-hover:scale-105" />
                        </Link>
                    </div>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map(link => (
                            <Link key={link.name} to={link.href} className="relative px-2 py-1 text-slate-700 font-semibold hover:text-indigo-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full">
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Section */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <UserDropdown userName={user?.profile?.fullName ?? user?.name ?? 'User'} onLogout={() => logout()} />
                        ) : (
                            <>
                                <Link to="/login" className="px-4 py-2 text-sm font-semibold text-indigo-700 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors shadow-sm">
                                    Login
                                </Link>
                            </>
                        )}
                    </div>
                    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setMobileMenuOpen(true)} aria-label="Open main menu" className="p-2 rounded-full bg-white/80 shadow hover:bg-indigo-100 transition-all">
                            <MenuIcon className="h-6 w-6 text-indigo-700" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Panel */}
            <Transition
                show={isMobileMenuOpen}
                as={Fragment}
                enter="transition ease-out duration-300"
                enterFrom="transform -translate-x-full"
                enterTo="transform translate-x-0"
                leave="transition ease-in duration-200"
                leaveFrom="transform translate-x-0"
                leaveTo="transform -translate-x-full"
            >
                <div className="md:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-800 opacity-60" onClick={() => setMobileMenuOpen(false)}></div>
                    <div className="relative w-4/5 max-w-sm h-full bg-white/90 backdrop-blur-lg p-6 rounded-r-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="font-bold text-indigo-900 text-lg">Menu</h2>
                            <button onClick={() => setMobileMenuOpen(false)} aria-label="Close main menu" className="p-2 rounded-full bg-white shadow hover:bg-indigo-100 transition-all">
                                <X className="h-6 w-6 text-indigo-700" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-4">
                             {navLinks.map(link => (
                                <Link key={link.name} to={link.href} className="relative px-2 py-2 text-slate-700 font-semibold hover:text-indigo-700 transition-colors after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-indigo-600 after:transition-all after:duration-300 hover:after:w-full" onClick={() => setMobileMenuOpen(false)}>
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                             {isAuthenticated ? (
                                <>
                                    <div className="flex items-center space-x-3">
                                        <UserCircle className="h-8 w-8 text-indigo-700"/>
                                        <div>
                                            <p className="font-semibold text-indigo-900">{user?.profile?.fullName ?? user?.name ?? 'User'}</p>
                                            <Link to="/profile" className="text-sm text-indigo-700 hover:underline" onClick={() => setMobileMenuOpen(false)}>View Profile</Link>
                                        </div>
                                    </div>
                                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="w-full text-left flex items-center text-slate-700 font-semibold hover:text-indigo-700 py-2">
                                        <LogOut className="mr-3 h-5 w-5"/>
                                        Logout
                                    </button>
                                </>
                             ) : (
                                <>
                                    <Link to="/login" className="w-full block text-center px-4 py-2 text-sm font-semibold text-indigo-700 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors shadow-sm" onClick={() => setMobileMenuOpen(false)}>
                                        Login
                                    </Link>
                                    <Link to="/register" className="w-full block text-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-md hover:bg-indigo-700 transition-colors shadow-md" onClick={() => setMobileMenuOpen(false)}>
                                        Register
                                    </Link>
                                </>
                             )}
                        </div>
                    </div>
                </div>
            </Transition>
        </header>
    );
};

// --- User Dropdown Component for Desktop ---
interface UserDropdownProps {
    userName: string;
    onLogout: () => void;
}

const UserDropdown: React.FC<UserDropdownProps> = ({ userName, onLogout }) => {
    return (
        <Menu as="div" className="relative">
            <Menu.Button className="flex items-center space-x-2 text-slate-600 hover:text-blue-600">
                <UserCircle className="h-8 w-8 text-slate-500" />
                <span className="font-medium text-sm hidden lg:block">{userName}</span>
                <ChevronDown className="h-4 w-4" />
            </Menu.Button>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-slate-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-1 py-1">
                         <Menu.Item>
                            {({ active }) => (
                                <Link to="/profile" className={`${active ? 'bg-blue-500 text-white' : 'text-slate-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                    <UserCircle className="mr-2 h-5 w-5" /> My Profile
                                </Link>
                            )}
                        </Menu.Item>
                        <Menu.Item>
                            {({ active }) => (
                                <Link to="/dashboard" className={`${active ? 'bg-blue-500 text-white' : 'text-slate-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                    <FileText className="mr-2 h-5 w-5" /> Apply Scheme
                                </Link>
                            )}
                        </Menu.Item>
                    </div>
                     <div className="px-1 py-1">
                        <Menu.Item>
                            {({ active }) => (
                                <button onClick={onLogout} className={`${active ? 'bg-blue-500 text-white' : 'text-slate-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                                    <LogOut className="mr-2 h-5 w-5" /> Logout
                                </button>
                            )}
                        </Menu.Item>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}

export default Navbar;