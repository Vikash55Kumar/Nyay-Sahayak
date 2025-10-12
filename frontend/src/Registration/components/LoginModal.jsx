import React, { useState } from 'react';

// --- SVG Icons (reused for consistency) ---
const FingerprintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 10v4"/><path d="M12 18v-2"/><path d="M7 22a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2"/><path d="M10 22a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2"/><path d="M14 22a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2"/><path d="M17 22a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2"/><path d="M5 18a2 2 0 0 0-2 2"/><path d="M19 18a2 2 0 0 1 2 2"/><path d="M7 14a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2"/><path d="M10 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/><path d="M14 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/><path d="M17 14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"/><path d="M10 10a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2"/><path d="M14 10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2"/><path d="M7 5a2 2 0 0 0 2 2h1"/><path d="M17 5a2 2 0 0 1-2 2h-1"/></svg>
);
const IdCardIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="M6 10h2"/><path d="M12 10h2"/><path d="M6 14h6"/><path d="M16 14h2"/></svg>
);

// --- Fingerprint Animation Component ---
const FingerprintAnimation = () => (
    <div className="scan">
        <div className="fingerprint"></div>
    </div>
);

// --- Login Modal Component ---
export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
    const [mode, setMode] = useState('aadhaar'); // 'aadhaar', 'otp', or 'fingerprint'
    const [aadhaarNumber, setAadhaarNumber] = useState('');

    if (!isOpen) return null;

    const handleGetOtp = () => {
        if (aadhaarNumber.length === 12) {
            setMode('otp');
        } else {
            alert('Please enter a valid 12-digit Aadhaar number.');
        }
    };

    const handleVerifyOtp = () => {
        // On successful OTP verification, call the success handler
        onLoginSuccess();
    };
    
    const activeTabClasses = 'border-blue-500 text-blue-600';
    const inactiveTabClasses = 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300';

    return (
        <>
            <style>{`
                .fade-in {
                    animation: fadeIn 0.5s ease-in-out forwards;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .scan {
                    position: relative;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-bottom: 20px;
                }
                .scan .fingerprint {
                    position: relative;
                    width: 120px; /* Reduced size */
                    height: 140px; /* Reduced size */
                    background: url(https://raw.githubusercontent.com/lasithadilshan/fingerprintanimation.github.io/main/fingerPrint_01.png);
                    background-size: 120px; /* Reduced size */
                }
                .scan .fingerprint::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: url(https://raw.githubusercontent.com/lasithadilshan/fingerprintanimation.github.io/main/fingerPrint_02.png);
                    background-size: 120px; /* Reduced size */
                    animation: animate 3s ease-in-out infinite;
                }
                @keyframes animate {
                    0%, 100% { height: 0%; }
                    50% { height: 100%; }
                }
                .scan .fingerprint::after {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 4px;
                    background: #00539C;
                    border-radius: 8px;
                    filter: drop-shadow(0 0 10px #00539C) drop-shadow(0 0 30px #00539C);
                    animation: animate_line 3s ease-in-out infinite;
                }
                @keyframes animate_line {
                    0%, 100% { top: 0%; }
                    50% { top: 100%; }
                }
                .scan h3 {
                    text-transform: uppercase;
                    font-size: 1.5em;
                    letter-spacing: 2px;
                    margin-top: 20px;
                    color: #00539C;
                    filter: drop-shadow(0 0 10px #00539C);
                    animation: animate_text 0.5s steps(1) infinite;
                }
                @keyframes animate_text {
                    0%, 100% { opacity: 0; }
                    50% { opacity: 1; }
                }
            `}</style>
            <div 
                className="rounded-tr-xl rounded-bl-xl fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/30 backdrop-blur-sm"
                onClick={onClose}
            >
                <div 
                    className="relative bg-white rounded-tr-xl rounded-bl-xl shadow-2xl w-full max-w-md m-4 transform transition-all fade-in overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Decorative background elements */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-blue-100 opacity-50 -z-500"></div>
                    <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full border-8 border-purple-200 opacity-50 -z-500"></div>
                    <div className="absolute top-1/2 left-1/4 w-20 h-20 rounded-full bg-green-100 opacity-50 -z-500"></div>
                    <button 
                        onClick={onClose} 
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-colors"
                        aria-label="Close modal"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-center text-gray-800">Login with Aadhaar</h2>
                        <p className="text-center text-gray-500 mt-2 text-sm">Please verify your identity to login.</p>
                    </div>
                    
                    {mode !== 'otp' && (
                        <div className="border-b border-gray-200">
                            <div className="flex -mb-px justify-center">
                                <button 
                                    onClick={() => setMode('aadhaar')}
                                    className={`flex items-center justify-center w-1/2 py-4 px-1 text-sm font-medium border-b-2 ${mode === 'aadhaar' ? activeTabClasses : inactiveTabClasses}`}
                                >
                                    <IdCardIcon />
                                    <span className="ml-2">Aadhaar Number</span>
                                </button>
                                <button 
                                    onClick={() => setMode('fingerprint')}
                                    className={`flex items-center justify-center w-1/2 py-4 px-1 text-sm font-medium border-b-2 ${mode === 'fingerprint' ? activeTabClasses : inactiveTabClasses}`}
                                >
                                    <FingerprintIcon />
                                    <span className="ml-2">Fingerprint Scan</span>
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="p-6">
                        {mode === 'aadhaar' && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="aadhaar-login" className="block text-sm font-medium text-gray-700 text-left">
                                        Enter your 12-digit Aadhaar Number
                                    </label>
                                    <div className="mt-1">
                                        <input 
                                            type="text" 
                                            id="aadhaar-login"
                                            value={aadhaarNumber}
                                            onChange={(e) => setAadhaarNumber(e.target.value.replace(/\D/g, ''))}
                                            maxLength="12"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="XXXX XXXX XXXX"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleGetOtp}
                                    disabled={aadhaarNumber.length !== 12}
                                    className="sheen w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative overflow-hidden disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: '#00539C' }}
                                >
                                    Get OTP
                                </button>
                            </div>
                        )}
                        {mode === 'otp' && (
                            <div className="space-y-6 fade-in">
                                <div>
                                    <label htmlFor="otp-login" className="block text-sm font-medium text-gray-700 text-left">
                                        Enter OTP sent to your registered mobile number
                                    </label>
                                    <div className="mt-1">
                                        <input 
                                            type="text" 
                                            id="otp-login"
                                            maxLength="6"
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            placeholder="XXXXXX"
                                        />
                                    </div>
                                    <div className="text-right mt-2">
                                        <button className="text-xs text-blue-600 hover:underline">Resend OTP</button>
                                    </div>
                                </div>
                                <button
                                    onClick={handleVerifyOtp}
                                    className="sheen w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative overflow-hidden"
                                    style={{ backgroundColor: '#00539C' }}
                                >
                                    Verify OTP & Login
                                </button>
                            </div>
                        )}
                        {mode === 'fingerprint' && (
                           <FingerprintAnimation />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
