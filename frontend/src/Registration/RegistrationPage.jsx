import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AadhaarVerificationModal from './components/AadhaarVerificationModal';
import LoginModal from './components/LoginModal';
import indiaBackground from '../assets/in.svg';
import logo from '../assets/logo.png'; 

// --- Background India Map SVG ---
const IndiaMapBackground = () => (
    <div 
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none" 
        aria-hidden="true"
    >
        <img
            src={indiaBackground}
            alt=""
            loading="lazy"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-auto opacity-12 mt-12"
        />
    </div>
);


// --- Main Registration Page Component ---
export default function RegistrationPage() {
    const [isRegisterModalOpen, setRegisterModalOpen] = useState(false);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        setLoginModalOpen(false);
        navigate('/dashboard'); // Navigate to dashboard on successful login
    };

    const blurClass = isRegisterModalOpen || isLoginModalOpen ? 'filter blur-sm' : '';

    return (
        <div style={{ backgroundColor: '#F8F9FA', fontFamily: "'Inter', sans-serif" }} className="min-h-screen relative">
            <IndiaMapBackground />
            <div className={`relative transition-filter duration-300 ${blurClass}`}>
                <main className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
                    <div className="max-w-md w-full bg-white/80 backdrop-blur-sm p-8 rounded-tr-xl rounded-bl-xl shadow-lg text-center m-4">
                        <div className="flex justify-center h-20 rounded-full">
                            <img src={logo} alt="Logo" className="h-20 w-20" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800">Welcome to Nyay Sahayak</h1>
                        <p className="mt-3 text-gray-600">
                            Your one-stop portal for accessing government schemes and support.
                        </p>
                        <div className="mt-8 space-y-4">
                            <button 
                                onClick={() => setRegisterModalOpen(true)}
                                className="sheen w-full text-white font-bold py-3 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105 relative overflow-hidden" 
                                style={{ backgroundColor: '#00539C' }}
                            >
                                Register with Aadhaar
                            </button>
                            <button 
                                onClick={() => setLoginModalOpen(true)}
                                className="sheen w-full text-gray-700 font-bold py-3 px-6 rounded-lg transition-transform duration-300 transform hover:scale-105 relative overflow-hidden border border-gray-300 bg-gray-50"
                            >
                                Login with Aadhaar
                            </button>
                        </div>
                        <p className="mt-6 text-xs text-gray-500">
                            By proceeding, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </main>
            </div>

            <AadhaarVerificationModal 
                isOpen={isRegisterModalOpen}
                onClose={() => setRegisterModalOpen(false)}
            />

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
}