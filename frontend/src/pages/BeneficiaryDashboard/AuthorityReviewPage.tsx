import React, { useState } from 'react';
import { Check, X, LoaderCircle} from 'lucide-react';

// --- MOCK DATA (from your verifyAtrocityApplicationForAuthority API) ---
const mockVerificationData = {
    // ... data from your backend for a specific application ...
    applicationDetails: { applicationId: "ATR_2025_987654", beneficiaryName: "Raju Lal", beneficiaryCategory: "SC" },
    firVerification: { success: true, data: { firNumber: "0129/2025", sections: "SC/ST Act 3(1)(r)" } },
    victimVerification: { isVictim: true, message: "Beneficiary is listed as the primary victim in the FIR." },
    caseStatus: { success: true, data: { caseStage: "Investigation Complete, Chargesheet Filed" } },
    compensationDetails: { eligible: true, amount: 200000, stage: "At the stage of chargesheet" },
    overallVerificationStatus: "VERIFIED",
    recommendations: ["Application is fully verified and eligible for compensation.", "Recommended amount: ₹200000"]
};

const AuthorityReviewPage: React.FC = () => {
    const [remarks, setRemarks] = useState('');
    const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleSubmit = async () => {
        if (!action) {
            setError("Please select an action (Approve or Reject).");
            return;
        }
        if (action === 'REJECT' && !remarks) {
            setError("Remarks are mandatory when rejecting an application.");
            return;
        }
        
        setIsLoading(true);
        setError(null);
        
        // SIMULATE API CALL to updateApplicationStatus
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        alert(`Application successfully ${action.toLowerCase()}d!`);
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-100 min-h-screen p-8">
            <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Case Details */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-lg border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h1 className="text-2xl font-bold text-slate-800">Application Review</h1>
                        <p className="text-slate-500 font-mono">{mockVerificationData.applicationDetails.applicationId}</p>
                    </div>
                    <div className="p-6 space-y-6">
                        {/* Verification Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                <h3 className="font-bold text-emerald-800">Overall Status: {mockVerificationData.overallVerificationStatus}</h3>
                            </div>
                             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h3 className="font-bold text-blue-800">Compensation: Eligible (₹{mockVerificationData.compensationDetails.amount.toLocaleString()})</h3>
                            </div>
                        </div>

                        {/* Detailed Sections */}
                        <div>
                            <h3 className="font-semibold text-lg text-slate-700 mb-2">Beneficiary Details</h3>
                            <p><strong>Name:</strong> {mockVerificationData.applicationDetails.beneficiaryName} | <strong>Category:</strong> {mockVerificationData.applicationDetails.beneficiaryCategory}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-slate-700 mb-2">FIR Verification</h3>
                            <p className="text-emerald-700">✓ FIR found in CCTNS. Sections: {mockVerificationData.firVerification.data.sections}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg text-slate-700 mb-2">Victim Verification</h3>
                            <p className="text-emerald-700">✓ {mockVerificationData.victimVerification.message}</p>
                        </div>
                         <div>
                            <h3 className="font-semibold text-lg text-slate-700 mb-2">e-Court Case Status</h3>
                            <p><strong>Stage:</strong> {mockVerificationData.caseStatus.data.caseStage}</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Action Panel */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 sticky top-8">
                        <div className="p-6 border-b border-slate-200">
                            <h2 className="text-xl font-bold text-slate-800">Take Action</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-700 mb-2">System Recommendation</h3>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {mockVerificationData.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                                </ul>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Remarks (Mandatory for Rejection)</label>
                                <textarea rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500"></textarea>
                            </div>
                            {error && <p className="text-sm text-red-600">{error}</p>}
                            <div className="flex space-x-3">
                                <button onClick={() => { setAction('REJECT'); handleSubmit(); }} disabled={isLoading} className="w-full flex justify-center items-center bg-red-600 text-white py-2.5 rounded-md font-semibold hover:bg-red-700 disabled:bg-red-300">
                                    {isLoading && action === 'REJECT' ? <LoaderCircle className="animate-spin" /> : <><X className="mr-2" size={16} />Reject</>}
                                </button>
                                <button onClick={() => { setAction('APPROVE'); handleSubmit(); }} disabled={isLoading} className="w-full flex justify-center items-center bg-emerald-600 text-white py-2.5 rounded-md font-semibold hover:bg-emerald-700 disabled:bg-emerald-300">
                                    {isLoading && action === 'APPROVE' ? <LoaderCircle className="animate-spin" /> : <><Check className="mr-2" size={16} />Approve</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthorityReviewPage;