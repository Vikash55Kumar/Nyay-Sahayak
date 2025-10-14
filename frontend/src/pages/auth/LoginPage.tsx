
import React, { useState, useEffect } from 'react';
import {LoaderCircle, AlertTriangle, Landmark } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { sendLoginOTPAsync, loginBeneficiaryAsync, getCurrentUserAsync } from '../../store/slices/authSlice';

// --- Reusable Form Input Component ---
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            <input
                className="w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-slate-400"
                {...props}
            />
        </div>
    </div>
);

// --- Main Login Page Component ---
const LoginPage: React.FC = () => {
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [isLoadingLocal, setIsLoadingLocal] = useState<boolean>(false);
    const [errorLocal, setErrorLocal] = useState<string | null>(null);
    const [aadhaarNumber, setAadhaarNumber] = useState<string>('');
    const [mobileNumber, setMobileNumber] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const dispatch = useAppDispatch();
    const { loading: authLoading, error: authError } = useAppSelector((state) => state.auth);

    // Sync Redux error/loading into local state for better UX
    useEffect(() => {
        setIsLoadingLocal(authLoading);
    }, [authLoading]);

    useEffect(() => {
        setErrorLocal(authError);
    }, [authError]);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorLocal(null);
        // Basic client-side validation
        if (aadhaarNumber.length !== 12 || mobileNumber.length !== 10) {
            setErrorLocal('Invalid Aadhaar or Mobile Number format.');
            return;
        }

        // Dispatch Redux thunk to send login OTP
        try {
            await dispatch(sendLoginOTPAsync({ aadhaarNumber, mobileNumber })).unwrap();
            setOtpSent(true);
        } catch (err) {
            // error will be reflected in auth slice; keep local fallback
            setErrorLocal(typeof err === 'string' ? err : 'Failed to send OTP');
        }
    };
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorLocal(null);

        if (otp.length !== 6) {
            setErrorLocal('Please enter a 6-digit OTP');
            return;
        }

        try {
            await dispatch(loginBeneficiaryAsync({ aadhaarNumber, mobileNumber, otp })).unwrap();
            await dispatch(getCurrentUserAsync());
            
            window.location.href = '/dashboard';
        } catch (err) {
            setErrorLocal(typeof err === 'string' ? err : 'Login failed');
        }
    };
    
    const handleBack = () => { setOtpSent(false); setErrorLocal(null); setOtp(''); };

    return (
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center py-8 px-2">
            {/* Centered Card for Login */}
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col lg:flex-row overflow-hidden animate-fade-in-up">
                {/* Left Branding Column */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-b from-indigo-100 to-slate-50 p-8 w-1/2 relative">
                    <div className="absolute inset-0 bg-repeat bg-center opacity-10 pointer-events-none" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
                    <div className="relative z-10 flex flex-col items-center justify-center h-full">
                        <Landmark className="h-16 w-16 text-indigo-500 mb-4" />
                        <h2 className="text-2xl font-bold text-slate-800 text-center">A Digital Gateway to Justice and Dignity.</h2>
                        <p className="mt-4 text-slate-600 text-center max-w-xs">
                            Our mission is to provide a transparent, efficient, and accessible platform for the direct delivery of benefits.
                        </p>
                    </div>
                    <div className="relative z-10 text-xs text-slate-400 text-center mt-8">
                        &copy; {new Date().getFullYear()} Government of India. All rights reserved.
                    </div>
                </div>
                {/* Right Login Form Column */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md">
                        <div className="mb-8 text-center">
                            <h2 className="text-3xl font-bold text-indigo-700">Beneficiary Login</h2>
                            <p className="text-slate-500 mt-2">
                                {otpSent ? "Enter the OTP sent to your mobile." : "Welcome back. Please use your Aadhaar to log in."}
                            </p>
                        </div>

                        {(errorLocal || authError) && (
                            <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-md flex items-center text-sm">
                                <AlertTriangle className="mr-3 h-5 w-5" />
                                <span>{errorLocal || authError}</span>
                            </div>
                        )}

                        <form onSubmit={otpSent ? handleLogin : handleSendOtp} className="space-y-6">
                            {!otpSent ? (
                                <>
                                    <div className="grid grid-cols-1 gap-6">
                                        <FormInput label="Aadhaar Number" type="text" placeholder="Enter 12-digit Aadhaar" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} maxLength={12} required />
                                        <FormInput label="Mobile Number" type="text" placeholder="Enter 10-digit mobile" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} maxLength={10} required />
                                    </div>
                                    <button type="submit" disabled={isLoadingLocal} className="w-full flex justify-center items-center bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 font-semibold transition-all shadow-sm hover:shadow-lg mt-4">
                                        {isLoadingLocal ? <LoaderCircle className="animate-spin" /> : 'Send OTP'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <FormInput label="Aadhaar Number" type="text" value={aadhaarNumber} disabled />
                                    <FormInput label="Enter OTP" type="text" placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required autoFocus />
                                    <div className="flex justify-between items-center text-sm mt-2">
                                        <button type="button" onClick={handleBack} className="text-slate-600 hover:text-indigo-600 font-medium">Change Number</button>
                                        <button type="button" className="text-indigo-600 hover:underline font-medium">Resend OTP</button>
                                    </div>
                                    <button type="submit" disabled={isLoadingLocal} className="w-full flex justify-center items-center bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:bg-emerald-300 font-semibold transition-all shadow-sm hover:shadow-lg mt-4">
                                        {isLoadingLocal ? <LoaderCircle className="animate-spin" /> : 'Verify & Login'}
                                    </button>
                                </>
                            )}
                        </form>

                        <div className="text-center mt-8 pt-6 border-t border-slate-200">
                            <p className="text-sm text-slate-600">
                                New to the portal?{' '}
                                <a href="/register" className="font-medium text-indigo-600 hover:underline">Register Here</a>
                            </p>
                            <p className="text-xs text-slate-500 mt-4">
                                Are you an Official or a CSC Operator?{' '}
                                <a href="/official-login" className="font-medium text-indigo-600 hover:underline">Login Here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;