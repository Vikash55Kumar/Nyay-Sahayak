// Filename: pages/authority/RegistrationReviewPage.tsx

import React, { useState } from 'react';
import { User, FileText, Check, X, LoaderCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- MOCK DATA ---
const mockRegistrationData = {
    registrationId: "REG_001",
    profile: {
        fullName: "Raju Lal",
        dob: "1985-05-15T00:00:00.000Z",
        gender: "Male",
        address: "Mogra Khurd, Jodhpur, Rajasthan, 342802",
    },
    casteDetails: {
        category: "SC",
        caste: "Meghwal",
        certificateNumber: "RSC/2024/MANUAL/78910",
    },
    documentUrl: "https://via.placeholder.com/800x1100.png?text=Caste+Certificate+Scan" // Placeholder for the document image
};

const RegistrationReviewPage: React.FC = () => {
    const [remarks, setRemarks] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAction = async (action: 'APPROVE' | 'REJECT') => {
        setIsLoading(true);
        console.log({ action, remarks, registrationId: mockRegistrationData.registrationId });
        await new Promise(resolve => setTimeout(resolve, 2000));
        alert(`Registration has been ${action.toLowerCase()}d.`);
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-100 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/authority/dashboard" className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 mb-6">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Information Panel */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-slate-200">
                        <div className="p-6 border-b border-slate-200">
                            <h1 className="text-2xl font-bold text-slate-800">Beneficiary Registration Review</h1>
                            <p className="text-slate-500 font-mono">ID: {mockRegistrationData.registrationId}</p>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Beneficiary Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-slate-700 flex items-center"><User className="mr-2" size={20}/>Beneficiary Details</h3>
                                <p><strong>Name:</strong> {mockRegistrationData.profile.fullName}</p>
                                <p><strong>DOB:</strong> {new Date(mockRegistrationData.profile.dob).toLocaleDateString()}</p>
                                <p><strong>Gender:</strong> {mockRegistrationData.profile.gender}</p>
                                <p><strong>Address:</strong> {mockRegistrationData.profile.address}</p>
                            </div>
                             {/* Caste Details */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg text-slate-700 flex items-center"><FileText className="mr-2" size={20}/>Caste Details (as provided)</h3>
                                <p><strong>Category:</strong> {mockRegistrationData.casteDetails.category}</p>
                                <p><strong>Caste:</strong> {mockRegistrationData.casteDetails.caste}</p>
                                <p><strong>Certificate No:</strong> {mockRegistrationData.casteDetails.certificateNumber}</p>
                            </div>
                        </div>
                        {/* Document Viewer */}
                        <div className="p-6 border-t border-slate-200">
                             <h3 className="font-semibold text-lg text-slate-700 mb-4">Uploaded Caste Certificate</h3>
                             <div className="border border-slate-300 rounded-lg p-2 bg-slate-50">
                                <img src={mockRegistrationData.documentUrl} alt="Caste Certificate" className="w-full rounded-md" />
                             </div>
                        </div>
                    </div>

                    {/* Right: Action Panel */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 sticky top-8">
                             <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-bold text-slate-800">Take Action</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <p className="text-sm text-slate-600">Review the uploaded document carefully. Once approved, the beneficiary will be able to apply for schemes.</p>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Mandatory for Rejection)</label>
                                    <textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"></textarea>
                                </div>
                                <div className="flex space-x-3">
                                    <button onClick={() => handleAction('REJECT')} disabled={isLoading} className="w-full flex justify-center items-center bg-red-600 text-white py-2.5 rounded-md font-semibold hover:bg-red-700 disabled:bg-red-300">
                                        {isLoading ? <LoaderCircle className="animate-spin" /> : <><X className="mr-2" size={16} />Reject</>}
                                    </button>
                                    <button onClick={() => handleAction('APPROVE')} disabled={isLoading} className="w-full flex justify-center items-center bg-emerald-600 text-white py-2.5 rounded-md font-semibold hover:bg-emerald-700 disabled:bg-emerald-300">
                                        {isLoading ? <LoaderCircle className="animate-spin" /> : <><Check className="mr-2" size={16} />Approve</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
};

export default RegistrationReviewPage;