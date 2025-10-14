import React, { useState, useEffect } from 'react';
import { initiateRegistrationAsync, verifyOTPAndGetAadhaarDataAsync, fetchCasteFromDigiLockerAsync, getCurrentUserAsync } from '../../store/slices/authSlice';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { completeRegistrationAsync } from '../../store/slices/authSlice';
import { Shield, User, FileText, Landmark, PartyPopper, LoaderCircle, AlertTriangle, ArrowRight, ArrowLeft, CheckCircle, XCircle, ShieldCheck, Calendar, HelpCircle, Fingerprint, Smartphone } from 'lucide-react';
import digilocker from '../../assets/digilocker.png'

interface StepProps {
    icon: React.ElementType;
    title: string;
    stepNumber: number;
    currentStep: number;
    isVerified?: boolean;
}

const StepperItem: React.FC<StepProps> = ({ icon: Icon, title, stepNumber, currentStep, isVerified }) => {
    const isActive = currentStep === stepNumber;
    const isCompleted = currentStep > stepNumber;
    const isError = isVerified === false;

    return (
        <div className="flex flex-col items-center">
            <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                    ${isActive ? 'bg-indigo-600 border-indigo-700 text-white' : ''}
                    ${isCompleted && !isError ? 'bg-emerald-500 border-emerald-600 text-white' : ''}
                    ${isCompleted && isError ? 'bg-red-500 border-red-600 text-white' : ''}
                    ${!isActive && !isCompleted && !isError ? 'bg-slate-100 border-slate-300 text-slate-500' : ''}
                `}
            >
                {isCompleted && !isError ? <CheckCircle size={24} /> : isCompleted && isError ? <XCircle size={24} /> : <Icon size={24} />}
            </div>
            <p className={`mt-2 text-sm text-center font-medium ${isActive ? 'text-indigo-600' : isCompleted && !isError ? 'text-emerald-600' : isCompleted && isError ? 'text-red-600' : 'text-slate-600'}`}>
                {title}
            </p>
        </div>
    );
};

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ElementType;
    width?: string;
}

const FormInput: React.FC<FormInputProps> = ({ label, icon: Icon, width, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="relative">
            {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />}
            <input
                className={` ${width ? `w-${width}` : 'w-full'} px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${Icon ? 'pl-10' : ''} disabled:bg-slate-100 disabled:cursor-not-allowed`}
                {...props}
            />
        </div>
    </div>
);

interface DigiLockerConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAllow: (selectedDocuments: string[]) => void;
    isLoading: boolean;
    partnerName: string;
    partnerLogoUrl?: string;
}


const DigiLockerConsentModal: React.FC<DigiLockerConsentModalProps> = ({ isOpen, onClose, onAllow, isLoading, partnerName, partnerLogoUrl }) => {
    const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
    const allDocuments = ['Caste Certificate (XX2345)', 'Aadhar Card (XX9730)'];

    useEffect(() => {
        // Pre-select the required document when the modal opens for the demo
        if (isOpen) {
            setSelectedDocuments(['Caste Certificate (XX2345)']);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCheckboxChange = (doc: string) => {
        setSelectedDocuments(prev =>
            prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
        );
    };
    
    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedDocuments(allDocuments);
        } else {
            setSelectedDocuments([]);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 font-sans">
            <div className="bg-white rounded-lg shadow-xl w-1/3 mx-auto animate-fade-in-up">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                    <img src={digilocker} alt="DigiLocker Logo" className="h-10" />
                    <div className="flex items-center space-x-2 text-emerald-500">
                        <ShieldCheck size={20} />
                        <span className="text-sm font-semibold">Secure</span>
                    </div>
                    {partnerLogoUrl ? (
                         <img src={partnerLogoUrl} alt={`${partnerName} Logo`} className="h-6" />
                    ) : (
                        <span className="text-slate-800 font-bold text-lg">{partnerName}</span>
                    )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-5">
                    <p className="text-slate-700">
                        Please provide your consent to share the following with <span className="font-bold">{partnerName}:</span>
                    </p>

                    {/* Issued Documents Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800">Issued Documents ({allDocuments.length})</span>
                            <label htmlFor="select-all" className="flex items-center space-x-2 text-sm text-indigo-600 cursor-pointer">
                                <span>Select all</span>
                                <input
                                    id="select-all"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                    onChange={handleSelectAll}
                                    checked={selectedDocuments.length === allDocuments.length}
                                />
                            </label>
                        </div>
                        <ul className="pl-4 space-y-2">
                            {allDocuments.map(doc => (
                                <li key={doc} className="flex items-center justify-between">
                                    <span className="text-slate-600">{doc}</span>
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                        checked={selectedDocuments.includes(doc)}
                                        onChange={() => handleCheckboxChange(doc)}
                                    />
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    <hr className="border-slate-200" />
                    
                    {/* Other Info Sections */}
                    <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                            <User className="text-slate-500 mt-1" size={20}/>
                            <div>
                                <p className="font-semibold text-slate-800">Profile information</p>
                                <p className="text-sm text-slate-500">Name, Date of Birth, Gender</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-3">
                            <Calendar className="text-slate-500 mt-1" size={20}/>
                            <div>
                                <p className="font-semibold text-slate-800">Consent validity date</p>
                                <p className="text-sm text-slate-500">20-April-2024 <button className="text-indigo-600 hover:underline ml-2">Edit</button></p>
                            </div>
                        </div>
                         <div className="flex items-start space-x-3">
                            <HelpCircle className="text-slate-500 mt-1" size={20}/>
                            <div>
                                <p className="font-semibold text-slate-800">Purpose</p>
                                <p className="text-sm text-slate-500">Benefit Application Verification</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-sm text-slate-500 pt-3 border-t border-slate-200">
                        <p>Consent validity is subject to applicable laws.</p>
                        <p className="mt-1">By clicking 'Allow', you giving consent to share with <span className='font-semibold text-black'>Naya Sahayak</span>.</p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex justify-between p-4 space-x-3 bg-slate-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-slate-300 rounded-md text-slate-700 font-semibold hover:bg-slate-100"
                        disabled={isLoading}
                    >
                        Deny
                    </button>
                    <button
                        onClick={() => onAllow(selectedDocuments)}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 flex items-center justify-center min-w-[100px]"
                        disabled={isLoading || !selectedDocuments.includes('Caste Certificate (XX2345)')}
                    >
                        {isLoading ? <LoaderCircle className="animate-spin" size={20} /> : 'Allow'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const RegistrationPage: React.FC = () => {
    // State Management
    const [step, setStep] = useState<number>(1);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [verificationMode, setVerificationMode] = useState<'OTP' | 'BIOMETRIC' | null>(null);

    // Form Data States
    const [aadhaarNumber, setAadhaarNumber] = useState<string>('');
    const [mobileNumber, setMobileNumber] = useState<string>('');
    const [otp, setOtp] = useState<string>('');
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [aadhaarData, setAadhaarData] = useState<any>(null);
    const [casteDetails, setCasteDetails] = useState<any>(null);
    const [bankDetails, setBankDetails] = useState({ accountHolder: '', bankName: '', branchName: '', accountNumber: '', confirmAccountNumber: '', ifsc: '' });
    // Manual editable personal fields (some Aadhaar payloads may not include these)
    const [email, setEmail] = useState<string>('');
    const [fatherName, setFatherName] = useState<string>('');
    const [motherName, setMotherName] = useState<string>('');
    // Redux
    const dispatch = useAppDispatch();
    const { loading, error: reduxError, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (reduxError) setError(reduxError);
    }, [reduxError]);

    useEffect(() => {
        if (user) {
            setFinalResponse({
                message: 'Registration complete! Your account is verified and active.',
                accountStatus: 'ACTIVE',
            });
            setStep(7);
        }
    }, [user]);

    // Personal fields are filled manually by the user. Aadhaar may not provide
    // email / parent names for all users, so do NOT auto-fill them here.

    // UI/Flow State
    const [casteVerificationMethod, setCasteVerificationMethod] = useState<'DIGILOCKER' | 'MANUAL_UPLOAD' | null>(null);
    const [manualCasteData, setManualCasteData] = useState({ caste: '', category: 'SC', certificateNumber: '' });
    const [finalResponse, setFinalResponse] = useState<any>(null);
    const [showDigiLockerModal, setShowDigiLockerModal] = useState<boolean>(false);

    // Verification Status for Stepper Icons
    const [aadhaarVerified, setAadhaarVerified] = useState<boolean | undefined>(undefined);
    const [casteVerified, setCasteVerified] = useState<boolean | undefined>(undefined);
    const [bankVerified, setBankVerified] = useState<boolean | undefined>(undefined);


    // --- API Handlers (Simulated) ---

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        // Dispatch Aadhaar OTP request via authSlice
        const result = await dispatch(initiateRegistrationAsync({ aadhaarNumber, mobileNumber }));
        if (initiateRegistrationAsync.fulfilled.match(result)) {
            setAadhaarVerified(true);
            setSessionToken(result.payload.sessionToken || '');
            setStep(2);
        } else {
            setError(result.payload as string || 'Invalid Aadhaar or Mobile Number.');
            setAadhaarVerified(false);
        }
        setIsLoading(false);
    };
    
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        // Dispatch OTP verification via authSlice
        const result = await dispatch(verifyOTPAndGetAadhaarDataAsync({ aadhaarNumber, mobileNumber, otp }));
        if (verifyOTPAndGetAadhaarDataAsync.fulfilled.match(result)) {
            setAadhaarData(result.payload.aadhaarData || result.payload);
            setSessionToken(result.payload.sessionToken || sessionToken || '');
            setAadhaarVerified(true);
            setStep(3);
        } else {
            setError(result.payload as string || 'Invalid OTP. Please try again.');
            setAadhaarVerified(false);
        }
        setIsLoading(false);
    };

    const handleBiometricVerification = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 2500)); 

        if (aadhaarNumber.length === 12 && aadhaarNumber !== '111122223333') {
             const mockAadhaarData = { fullName: "Raju Lal", dob: "15-05-1985", gender: "Male", address: { street: "Mogra Khurd", district: "Jodhpur", state: "Rajasthan", pincode: "342802" }};
            // use mocked data for the demo flow
            setAadhaarData(mockAadhaarData);
            setAadhaarVerified(true);
            setStep(3);
        } else {
            setError("Biometric verification failed or Aadhaar is invalid. Please try again.");
            setAadhaarVerified(false);
        }
        setIsLoading(false);
    };

    const handleDigiLockerConsent = async (selectedDocuments: string[]) => {
        setShowDigiLockerModal(false);
        if (!selectedDocuments.includes('Caste Certificate (XX2345)')) {
            setError("Caste Certificate must be selected from DigiLocker.");
            setCasteVerified(false);
            return;
        }
        setError(null);
        setIsLoading(true);
        setCasteVerificationMethod('DIGILOCKER');
        // Call Redux thunk to fetch certificate from DigiLocker
        const result = await dispatch(fetchCasteFromDigiLockerAsync({ sessionToken: sessionToken || '', aadhaarNumber }));
        if (fetchCasteFromDigiLockerAsync.fulfilled.match(result)) {

            const payload = result.payload;
            const details = payload.casteDetails || payload.certificate || payload;
            setCasteDetails(details);
            setCasteVerified(true);
        } else {
            setError(result.payload as string || 'Failed to fetch certificate from DigiLocker');
            setCasteVerified(false);
        }
        setIsLoading(false);
    };

    const handleCompleteRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        // Compose registration payload
        const payload = {
            sessionToken: sessionToken || '',
            aadhaarNumber,
            mobileNumber,
            aadhaarData,
            personalDetails: {
                email,
                fatherName,
                motherName,
            },
            casteDetails,
            bankDetails,
        };
        
        await dispatch(completeRegistrationAsync(payload));
        await dispatch(getCurrentUserAsync());
        setIsLoading(false);
    };

    const STEPS = [
        { number: 1, title: "Aadhaar Verify", icon: Shield },
        { number: 2, title: "OTP/Bio Verify", icon: Shield },
        { number: 3, title: "Personal Details", icon: User },
        { number: 4, title: "Certificate Verify", icon: FileText },
        { number: 5, title: "Bank Details", icon: Landmark },
        { number: 6, title: "Review & Submit", icon: FileText }
    ];

    return (
        <div className="bg-slate-50 min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <header className="w-full max-w-5xl mb-6">
                <div className="flex items-center space-x-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" className="h-16" />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Nyay Sahayak Portal</h1>
                        <p className="text-sm text-slate-600">Ministry of Social Justice & Empowerment, Govt. of India</p>
                    </div>
                </div>
            </header>
            
            <main className="w-full max-w-5xl bg-white rounded-lg shadow-lg border border-slate-200">
                {step < 7 && (
                    <div className="p-6 border-b border-slate-200">
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                           {STEPS.map((s) => (
                               <StepperItem
                                   key={s.number}
                                   icon={s.icon}
                                   title={s.title}
                                   stepNumber={s.number}
                                   currentStep={step}
                                   isVerified={s.number <= 2 ? aadhaarVerified : s.number === 3 ? aadhaarVerified : s.number === 4 ? casteVerified : s.number === 5 ? bankVerified : undefined}
                               />
                           ))}
                        </div>
                    </div>
                )}
                
                <div className="p-6 sm:p-8">
                    {error && ( <div className="bg-red-100 border-l-4 border-red-500 text-red-800 p-4 mb-6 rounded-md flex items-center"> <AlertTriangle className="mr-3" /> <span>{error}</span> </div> )}

                    {step === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800">Choose Registration Method</h2>
                            <p className="text-slate-600">Please select how you would like to verify your Aadhaar to begin.</p>
                            
                            {!verificationMode && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <button onClick={() => setVerificationMode('OTP')} className="p-6 border-2 border-indigo-500 rounded-lg text-indigo-600 hover:bg-indigo-50 flex flex-col items-center text-center transition-all">
                                        <Smartphone size={40} />
                                        <span className="mt-3 font-bold text-lg">Self Registration</span>
                                        <span className="text-sm text-slate-500 mt-1">(Requires Aadhaar-linked Mobile for OTP)</span>
                                    </button>
                                    <button onClick={() => setVerificationMode('BIOMETRIC')} className="p-6 border-2 border-slate-300 rounded-lg text-slate-700 hover:border-slate-500 hover:bg-slate-50 flex flex-col items-center text-center transition-all">
                                        <Fingerprint size={40} />
                                        <span className="mt-3 font-bold text-lg">Assisted Registration (CSC)</span>
                                        <span className="text-sm text-slate-500 mt-1">(Verify with Fingerprint at a Service Center)</span>
                                    </button>
                                </div>
                            )}

                            {verificationMode === 'OTP' && (
                                <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in-up">
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                    <FormInput label="Aadhaar Number" type="text" placeholder="Enter 12-digit Aadhaar number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} maxLength={12} required />
                                    <FormInput label="Mobile Number" type="text" placeholder="Enter 10-digit mobile number" value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} maxLength={10} required />
                                    </div>
                                    <div className="flex justify-between items-center">
                                        {/* <button type="button" onClick={() => setVerificationMode(null)} className="text-sm text-indigo-600 hover:underline">&larr; Back to choices</button> */}
                                        <button onClick={() => setVerificationMode(null)} className="flex items-center bg-slate-200 text-slate-800 py-2 px-4 rounded-md hover:bg-slate-300">
                                            <ArrowLeft className="mr-2" size={18} /> Back to choices
                                        </button>
                                        <button type="submit" disabled={isLoading} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading ? <LoaderCircle className="animate-spin mr-2" /> : 'Send OTP'}</button>
                                    </div>
                                </form>
                            )}

                            {verificationMode === 'BIOMETRIC' && (
                                <form onSubmit={handleBiometricVerification} className="space-y-6 animate-fade-in-up">
                                    <p className="p-4 bg-amber-50 text-amber-800 border-l-4 border-amber-400 rounded-md text-sm"><strong>For CSC Operator:</strong> Enter beneficiary's Aadhaar and ask them to place their finger on the biometric scanner.</p>
                                    <FormInput label="Beneficiary's Aadhaar Number" type="text" placeholder="Enter 12-digit Aadhaar number" value={aadhaarNumber} onChange={e => setAadhaarNumber(e.target.value)} maxLength={12} required />
                                    <div className="flex justify-between items-center">
                                        <button type="button" onClick={() => setVerificationMode(null)} className="text-sm text-indigo-600 hover:underline">&larr; Back to choices</button>
                                        <button type="submit" disabled={isLoading} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading ? <LoaderCircle className="animate-spin mr-2" /> : <> <Fingerprint className="mr-2" size={18}/> Initiate Scan </> }</button>
                                    </div>
                                    {isLoading && <p className="text-center text-slate-600 font-semibold mt-4">Scanning... Please wait.</p>}
                                </form>
                            )}
                        </div>
                    )}
                    
                    {step === 2 && verificationMode === 'OTP' && (
                         <form onSubmit={handleVerifyOtp} className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800">Verify OTP</h2>
                            <p className="text-slate-600">An OTP has been sent to your mobile number ending in ******{mobileNumber.slice(-4)}.</p>
                            <FormInput label="Enter OTP" type="text" width='1/2' placeholder="Enter 6-digit OTP" value={otp} onChange={e => setOtp(e.target.value)} maxLength={6} required />
                            <div className="flex justify-between mt-6">
                                <button type="button" onClick={() => setStep(1)} className="flex items-center bg-slate-200 text-slate-800 py-2 px-4 rounded-md hover:bg-slate-300"><ArrowLeft className="mr-2" size={18} /> Back</button>
                                <button type="submit" disabled={isLoading} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">{isLoading ? <LoaderCircle className="animate-spin mr-2" /> : 'Verify & Proceed'}</button>
                            </div>
                        </form>
                    )}
                    
                    {step === 3 && aadhaarData && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800">Personal Details</h2>
                            <p className="text-slate-600">These details have been fetched from your Aadhaar. Please verify them.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormInput label="Full Name" value={aadhaarData.fullName} disabled />
                                <FormInput label="Date of Birth" value={aadhaarData.dob} disabled />
                                <FormInput label="Gender" value={aadhaarData.gender} disabled />
                                <FormInput label="Email" type='email' required value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email (if not present in Aadhaar)" />
                                <FormInput label="Father Name" required value={fatherName} onChange={e => setFatherName(e.target.value)} placeholder="Enter father's name" />
                                <FormInput label="Mother Name" required value={motherName} onChange={e => setMotherName(e.target.value)} placeholder="Enter mother's name" />
                                <FormInput label="Address" value={`${aadhaarData.address.street}, ${aadhaarData.address.village}`} disabled />
                                <FormInput label="District" value={aadhaarData.address.district} disabled />
                                <FormInput label="State" value={aadhaarData.address.state} disabled />
                                <FormInput label="Pincode" value={aadhaarData.address.pincode} disabled />
                                {/* <FormInput label="Address" value={`${aadhaarData.address.street}, ${aadhaarData.address.district}, ${aadhaarData.address.state} - ${aadhaarData.address.pincode}`} disabled /> */}
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(2)} className="flex items-center bg-slate-200 text-slate-800 py-2 px-4 rounded-md hover:bg-slate-300">
                                    <ArrowLeft className="mr-2" size={18} /> Back
                                </button>
                                <button onClick={() => setStep(4)} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                                    Next <ArrowRight className="ml-2" size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {step === 4 && (
                        <div className="space-y-6">
                             <h2 className="text-2xl font-bold text-slate-800">Caste Certificate Verification</h2>
                             <p className="text-slate-600">Verify your certificate using one of the methods below for faster processing.</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={() => setShowDigiLockerModal(true)} className="p-6 border-2 border-indigo-500 rounded-lg text-indigo-600 hover:bg-indigo-50 flex flex-col items-center">
                                    <FileText size={40} />
                                    <span className="mt-2 font-bold">Verify with DigiLocker</span>
                                    <span className="text-xs text-slate-500">(Recommended & Instant)</span>
                                </button>
                                <button onClick={() => { setCasteVerificationMethod('MANUAL_UPLOAD'); setCasteDetails(null); }} className="p-6 border-2 border-slate-300 rounded-lg text-slate-700 hover:border-slate-500 hover:bg-slate-50 flex flex-col items-center">
                                    <FileText size={40} />
                                    <span className="mt-2 font-bold">Upload Manually</span>
                                    <span className="text-xs text-slate-500">(Requires Authority Approval)</span>
                                </button>
                             </div>
                             
                             {isLoading && casteVerificationMethod === 'DIGILOCKER' && (
                                <div className="text-center p-4">
                                    <LoaderCircle className="animate-spin inline-block text-indigo-600" />
                                    <p className="mt-2 text-slate-600">Verifying with DigiLocker...</p>
                                </div>
                             )}

                             {casteDetails && casteVerificationMethod === 'DIGILOCKER' && (
                                <div className="bg-emerald-100 border-l-4 border-emerald-500 text-emerald-800 p-4 mt-4 rounded-md">
                                    <h3 className="font-bold">DigiLocker Verification Successful!</h3>
                                    <p>Category: {casteDetails.category}, Caste: {casteDetails.caste}</p>
                                </div>
                             )}
                             
                             {casteVerificationMethod === 'MANUAL_UPLOAD' && (
                                <div className="space-y-4 pt-4 border-t mt-6">
                                    <h3 className="font-semibold text-lg text-slate-700">Manual Upload Details</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-2 gap-6">

                                        <FormInput label="Caste" placeholder='eg. Bhil Meena' value={manualCasteData.caste} onChange={e => setManualCasteData({...manualCasteData, caste: e.target.value})} />
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                            <select value={manualCasteData.category} onChange={e => setManualCasteData({...manualCasteData, category: e.target.value as 'SC' | 'ST'})} className="w-full px-4 py-2 border border-slate-300 rounded-md cursor-pointer">
                                                <option value="SC">Scheduled Caste (SC)</option>
                                                <option value="ST">Scheduled Tribe (ST)</option>
                                            </select>
                                        </div>
                                        <FormInput label="Certificate Number" value={manualCasteData.certificateNumber} onChange={e => setManualCasteData({...manualCasteData, certificateNumber: e.target.value})} />
                                        <FormInput label="Upload Certificate (PDF, JPG)" type="file" />
                                    </div>
                                </div>
                             )}

                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(3)} className="flex items-center bg-slate-200 text-slate-800 py-2 px-4 rounded-md hover:bg-slate-300">
                                    <ArrowLeft className="mr-2" size={18} /> Back
                                </button>
                                <button onClick={() => { if (casteVerificationMethod === 'MANUAL_UPLOAD' && !casteDetails) { setCasteDetails({ ...manualCasteData, verificationMethod: 'MANUAL_UPLOAD', verificationStatus: 'PENDING' }); } setStep(5); }} disabled={!casteDetails && !casteVerificationMethod} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300">
                                    Next <ArrowRight className="ml-2" size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {step === 5 && (
                        <div className="space-y-6">
                             <h2 className="text-2xl font-bold text-slate-800">Bank Account Details</h2>
                             <p className="text-slate-600">Provide your bank details for Direct Benefit Transfer (DBT).</p>
                             <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                                <FormInput label="Account Holder Name" value={bankDetails.accountHolder} onChange={e => setBankDetails({...bankDetails, accountHolder: e.target.value})} />
                                <FormInput label="Bank Name" value={bankDetails.bankName} onChange={e => setBankDetails({...bankDetails, bankName: e.target.value})} />
                                <FormInput label="Branch Name" value={bankDetails.branchName} onChange={e => setBankDetails({...bankDetails, branchName: e.target.value})} />
                                <FormInput label="Account Number" value={bankDetails.accountNumber} onChange={e => setBankDetails({...bankDetails, accountNumber: e.target.value})} />
                                <FormInput label="Confirm Account Number" value={bankDetails.confirmAccountNumber} onChange={e => setBankDetails({...bankDetails, confirmAccountNumber: e.target.value})} />
                                <FormInput label="IFSC Code" value={bankDetails.ifsc} onChange={e => setBankDetails({...bankDetails, ifsc: e.target.value})} />
                            </div>
                            <div className="flex justify-between mt-6">
                                <button onClick={() => setStep(4)} className="flex items-center bg-slate-200 text-slate-800 py-2 px-4 rounded-md hover:bg-slate-300">
                                    <ArrowLeft className="mr-2" size={18} /> Back
                                </button>
                                <button onClick={() => { setBankVerified(true); setStep(6); }} className="flex items-center bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700">
                                    Review Application <ArrowRight className="ml-2" size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {step === 6 && (
                        <form onSubmit={handleCompleteRegistration} className="space-y-6">
                            <h2 className="text-2xl font-bold text-slate-800">Review Your Application</h2>
                            <p className="text-slate-600">Please review all your details carefully before final submission.</p>

                            <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                                <h3 className="font-semibold text-lg text-indigo-700">Step 1: Aadhaar Details</h3>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <p><strong>Aadhaar Number:</strong> {aadhaarNumber}</p>
                                    <p><strong>Mobile Number:</strong> {mobileNumber}</p>
                                </div>

                                <h3 className="font-semibold text-lg text-indigo-700 mt-4">Step 3: Personal Details</h3>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <p><strong>Name:</strong> {aadhaarData?.fullName}</p>
                                    <p><strong>Date of Birth:</strong> {aadhaarData?.dob}</p>
                                    <p><strong>Gender:</strong> {aadhaarData?.gender}</p>
                                    <p><strong>Email:</strong> {email || aadhaarData?.email || '—'}</p>
                                    <p><strong>Father Name:</strong> {fatherName || aadhaarData?.address?.fatherName || aadhaarData?.fatherName || '—'}</p>
                                    <p><strong>Mother Name:</strong> {motherName || aadhaarData?.address?.motherName || aadhaarData?.motherName || '—'}</p>
                                    <p><strong>Address:</strong> {aadhaarData?.address ? `${aadhaarData.address.house}, ${aadhaarData.address.locality}` : ''}</p>
                                    <p><strong>District:</strong> {aadhaarData?.address?.district}</p>
                                    <p><strong>State:</strong> {aadhaarData?.address?.state}</p>
                                    <p><strong>Pincode:</strong> {aadhaarData?.address?.pincode}</p>
                                </div>

                                <h3 className="font-semibold text-lg text-indigo-700 mt-4">Step 4: Certificate Details</h3>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <p><strong>Verification Method:</strong> {casteDetails?.verificationMethod}</p>
                                    <p><strong>Category:</strong> {casteDetails?.category}</p>
                                    <p><strong>Caste:</strong> {casteDetails?.caste}</p>
                                    <p><strong>Certificate Number:</strong> {casteDetails?.certificateNumber}</p>
                                    {casteDetails?.verificationMethod === 'MANUAL_UPLOAD' && (
                                        <p><strong>Document Uploaded:</strong> {casteDetails?.documentUrl ? 'Yes' : 'No'}</p>
                                    )}
                                </div>

                                <h3 className="font-semibold text-lg text-indigo-700 mt-4">Step 5: Bank Details</h3>
                                <div className="grid grid-cols-2 gap-4 mb-2">
                                    <p><strong>Account Holder:</strong> {bankDetails.accountHolder}</p>
                                    <p><strong>Bank Name:</strong> {bankDetails.bankName}</p>
                                    <p><strong>Branch Name:</strong> {bankDetails.branchName}</p>
                                    <p><strong>Account Number:</strong> {bankDetails.accountNumber}</p>
                                    <p><strong>IFSC Code:</strong> {bankDetails.ifsc}</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <input id="declaration" type="checkbox" required className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 mt-1" />
                                <label htmlFor="declaration" className="ml-2 block text-sm text-slate-900">
                                    I hereby declare that the information provided is true and correct to the best of my knowledge.
                                </label>
                            </div>

                            <div className="flex justify-between mt-6">
                                <button type="button" onClick={() => setStep(5)} className="flex items-center bg-slate-200 text-slate-800 py-2 px-4 rounded-md hover:bg-slate-300">
                                    <ArrowLeft className="mr-2" size={18} /> Back
                                </button>
                                <button type="submit" disabled={isLoading || loading} className="w-1/2 flex justify-center items-center bg-emerald-600 text-white py-3 rounded-md hover:bg-emerald-700 disabled:bg-emerald-300">
                                    {(isLoading || loading) ? <LoaderCircle className="animate-spin mr-2" /> : 'Confirm & Submit'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 7 && finalResponse && (
                        <div className="text-center py-12">
                            <PartyPopper className="mx-auto h-20 w-20 text-emerald-500" />
                            <h2 className="mt-4 text-3xl font-bold text-slate-800">Registration Submitted!</h2>
                            <p className="mt-2 text-slate-600">{finalResponse.message}</p>
                            <p className="mt-2 font-semibold text-lg">Account Status: <span className={finalResponse.accountStatus === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'}>{finalResponse.accountStatus}</span></p>
                            <button onClick={() => alert("Redirecting to dashboard...")} className="mt-8 bg-indigo-600 text-white py-3 px-6 rounded-md hover:bg-indigo-700">
                                Go to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <DigiLockerConsentModal
                isOpen={showDigiLockerModal}
                onClose={() => setShowDigiLockerModal(false)}
                onAllow={handleDigiLockerConsent}
                isLoading={isLoading}
                partnerName="Nyay Sahayak"
            />
        </div>
    );
};

export default RegistrationPage;