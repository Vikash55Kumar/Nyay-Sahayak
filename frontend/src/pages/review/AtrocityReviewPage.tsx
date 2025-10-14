import React, { useState } from 'react';
import { Check, X, LoaderCircle, ArrowLeft, ShieldCheck, ShieldOff, Server } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- MOCK DATA & API SIMULATION ---
const applicationData = {
    applicationId: "ATR_2025_987654",
    beneficiaryName: "Raju Lal",
    beneficiaryCategory: "SC",
    firDetailsSubmitted: { firNumber: "0129/2025", policeStation: "Luni PS, Jodhpur", district: "Jodhpur Rural" }
};

const mockApiFetch = {
    cctns: { success: true, data: { firNumber: "0129/2025", sections: "SC/ST Act 3(1)(r)", victimName: "Raju Lal" } },
    eCourts: { success: true, data: { caseStage: "Investigation Complete, Chargesheet Filed" } },
    compensation: { eligible: true, amount: 200000, stage: "At the stage of chargesheet filing" }
};

const VerificationCheck = ({ success, text, data }: { success: boolean, text: string, data?: string }) => (
    <div className={`flex items-start space-x-3 p-3 rounded-md ${success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
        {success ? <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0 mt-0.5" /> : <ShieldOff size={20} className="text-red-500 flex-shrink-0 mt-0.5" />}
        <div>
            <span className="font-semibold">{text}</span>
            {data && <p className="text-xs">{data}</p>}
        </div>
    </div>
);

const AtrocityReviewPage: React.FC = () => {
    const [verificationState, setVerificationState] = useState<'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [verificationData, setVerificationData] = useState<any>(null);
    const [remarks, setRemarks] = useState('');
    const [isLoading] = useState(false);

    const handleFetchVerification = async () => {
        setVerificationState('FETCHING');
        // Simulate API calls to CCTNS and eCourts
        await new Promise(resolve => setTimeout(resolve, 2500));
        setVerificationData(mockApiFetch);
        setVerificationState('SUCCESS');
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
                            <h1 className="text-2xl font-bold text-slate-800">Atrocity Relief Review</h1>
                            <p className="text-slate-500 font-mono">ID: {applicationData.applicationId}</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h3 className="font-semibold text-lg text-slate-700 mb-2">Beneficiary Details</h3>
                                <p><strong>Name:</strong> {applicationData.beneficiaryName} | <strong>Category:</strong> {applicationData.beneficiaryCategory}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-700 mb-2">FIR Details (as submitted by Applicant)</h3>
                                <p><strong>FIR No:</strong> {applicationData.firDetailsSubmitted.firNumber}</p>
                                <p><strong>Police Station:</strong> {applicationData.firDetailsSubmitted.policeStation}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Action Panel */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-lg border border-slate-200 sticky top-8">
                            <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800">System Verification</h2></div>
                            <div className="p-6">
                                {verificationState === 'IDLE' && (
                                    <button onClick={handleFetchVerification} className="w-full flex justify-center items-center bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700">
                                        <Server className="mr-2" size={16} /> Fetch Details from CCTNS & eCourts
                                    </button>
                                )}
                                {verificationState === 'FETCHING' && (
                                    <div className="flex flex-col items-center text-center text-slate-500">
                                        <LoaderCircle className="animate-spin h-8 w-8" />
                                        <p className="mt-2 text-sm font-semibold">Verifying records...</p>
                                    </div>
                                )}
                                {verificationState === 'SUCCESS' && verificationData && (
                                    <div className="space-y-3 animate-fade-in-up">
                                        <VerificationCheck success={verificationData.cctns.success} text="CCTNS FIR Verified" data={`Victim: ${verificationData.cctns.data.victimName}`} />
                                        <VerificationCheck success={verificationData.eCourts.success} text="eCourts Case Status Fetched" data={`Stage: ${verificationData.eCourts.data.caseStage}`} />
                                        <VerificationCheck success={verificationData.compensation.eligible} text="Compensation Eligible" data={`Amount: ₹${verificationData.compensation.amount.toLocaleString()}`} />
                                    </div>
                                )}
                            </div>
                            
                            {/* Action section appears after verification */}
                            {verificationState === 'SUCCESS' && (
                                <div className="p-6 border-t border-slate-200 animate-fade-in-up">
                                    <h2 className="text-xl font-bold text-slate-800 mb-4">Take Action</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                                            <textarea rows={3} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md"></textarea>
                                        </div>
                                        <div className="flex space-x-3">
                                            <button disabled={isLoading} className="w-full flex justify-center items-center bg-red-600 text-white py-2.5 rounded-md font-semibold hover:bg-red-700"> <X className="mr-2" size={16} />Reject</button>
                                            <button disabled={isLoading} className="w-full flex justify-center items-center bg-emerald-600 text-white py-2.5 rounded-md font-semibold hover:bg-emerald-700"> <Check className="mr-2" size={16} />Approve</button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
};

export default AtrocityReviewPage;