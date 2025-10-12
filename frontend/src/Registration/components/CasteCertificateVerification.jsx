import React, { useState } from 'react';
import digilockerLogo from '../../assets/digilocker-seeklogo.png';

// --- SVG Icons ---
const DigiLockerIcon = () => (
    <img src={digilockerLogo} alt="DigiLocker" className="h-10" />
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);


// --- Main Component ---
export default function CasteCertificateVerification({ onFinish }) {
    const [verificationMethod, setVerificationMethod] = useState(null); // 'digilocker' or 'manual'
    const [isVerified, setIsVerified] = useState(false);
    const [fileName, setFileName] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFileName(e.target.files[0].name);
        }
    };

    const handleVerification = () => {
        // Simulate verification process
        setIsVerified(true);
    };

    // Final screen after any verification
    if (isVerified) {
        return (
            <div className="text-center p-6 fade-in">
                <CheckCircleIcon />
                <h3 className="text-xl font-bold text-gray-800 mt-4">Verification Submitted</h3>
                <p className="text-gray-600 mt-2">
                    Your account will be activated within 3-5 business days after successful review.
                </p>
                <button
                    onClick={onFinish}
                    className="sheen w-full mt-8 py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative overflow-hidden"
                    style={{ backgroundColor: '#00539C' }}
                >
                    Finish
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 fade-in">
            {!verificationMethod ? (
                // --- Method Selection ---
                <div className="space-y-4">
                    <button
                        onClick={() => setVerificationMethod('digilocker')}
                        className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <DigiLockerIcon />
                        <span className="font-medium">Verify with DigiLocker</span>
                    </button>
                    <button
                        onClick={() => setVerificationMethod('manual')}
                        className="w-full flex items-center justify-center gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <UploadIcon />
                        <span className="font-medium">Manual Upload</span>
                    </button>
                </div>
            ) : verificationMethod === 'digilocker' ? (
                // --- DigiLocker Flow ---
                <div className="text-center">
                    <p className="text-gray-600 mb-4">You will be redirected to DigiLocker to securely verify your certificate.</p>
                    <button
                        onClick={handleVerification}
                        className="sheen w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative overflow-hidden"
                        style={{ backgroundColor: '#00539C' }}
                    >
                        Proceed to DigiLocker
                    </button>
                </div>
            ) : (
                // --- Manual Upload Flow ---
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Upload your Caste Certificate (PDF, JPG, PNG)
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                        <span>Upload a file</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">Max. 5MB</p>
                                {fileName && <p className="text-sm text-green-600 mt-2">{fileName}</p>}
                            </div>
                        </div>
                    </div>
                     <button
                        onClick={handleVerification}
                        disabled={!fileName}
                        className="sheen w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative overflow-hidden disabled:bg-gray-400 disabled:cursor-not-allowed"
                        style={{ backgroundColor: '#00539C' }}
                    >
                        Upload & Complete Registration
                    </button>
                </div>
            )}
        </div>
    );
}
