import React, { useState } from 'react';
import { ArrowLeft, LoaderCircle, Server, ShieldCheck, ShieldOff } from 'lucide-react';
import { Link } from 'react-router-dom';

// --- MOCK DATA (Reflecting backend API response) ---
// const mockMarriageData = {
//     applicationId: "MAR_2025_184592",
//     applicant: { name: "Priya Kumari", category: "SC", aadhaar: "xxxx-xxxx-5678" },
//     spouse: { name: "Suresh Kumar", category: "GENERAL", aadhaar: "xxxx-xxxx-1234" },
//     verification: {
//         isIntercaste: true,
//         message: "Marriage is a valid inter-caste union.",
//         certificateStatus: "VERIFIED",
//     },
//     documents: [
//         { name: "MarriageCertificate.pdf", url: "#" },
//         { name: "SpouseAadhaar.pdf", url: "#" },
//         { name: "SpouseCasteCert.pdf", url: "#" },
//     ]
// };

// --- MOCK DATA & API SIMULATION ---
const applicationData = {
    applicationId: "MAR_2025_184592",
    applicant: { name: "Priya Kumari", category: "SC" },
    spouseSubmitted: { name: "Suresh Kumar", category: "GENERAL" },
    marriageRegId: "RJM/JOD/2024/6789",
    documents: [ { name: "MarriageCertificate.pdf", url: "#" }, { name: "SpouseAadhaar.pdf", url: "#" }, { name: "SpouseCasteCert_GEN.pdf", url: "#" } ]
};

const mockApiFetch = {
    marriageAPI: { success: true, data: { husbandName: "Suresh Kumar", wifeName: "Priya Kumari", dateOfMarriage: "2024-02-18" } },
};

const VerificationCheck = ({ success, text }: { success: boolean, text: string }) => (
    <div className={`flex items-center space-x-2 p-3 rounded-md ${success ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
        {success ? <ShieldCheck size={20} className="text-emerald-500" /> : <ShieldOff size={20} className="text-red-500" />}
        <span className="font-medium">{text}</span>
    </div>
);

const MarriageReviewPage: React.FC = () => {
    // Authority action panel state
    const [remarks, setRemarks] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [actionResult, setActionResult] = useState<string | null>(null);
    const [verificationState, setVerificationState] = useState<'IDLE' | 'FETCHING' | 'SUCCESS' | 'ERROR'>('IDLE');
    type MarriageVerificationData = {
        marriageAPI: {
            success: boolean;
            data: {
                husbandName: string;
                wifeName: string;
                dateOfMarriage: string;
            };
        };
        recommendations?: string[];
        verificationStatus?: string;
    } | null;
    const [verificationData, setVerificationData] = useState<MarriageVerificationData>(null);

    // Simulate backend verification logic
    const handleFetchVerification = async () => {
        setVerificationState('FETCHING');
        await new Promise(resolve => setTimeout(resolve, 1800));
        // Simulate recommendations and status as backend
        const isIntercaste = applicationData.applicant.category !== applicationData.spouseSubmitted.category;
        const recommendations = [];
        let verificationStatus = 'PENDING';
        if (mockApiFetch.marriageAPI.success && isIntercaste) {
            verificationStatus = 'VERIFIED';
            recommendations.push('Marriage record found and verified in Registrar database.');
            recommendations.push('Inter-caste union confirmed. Eligible for incentive.');
            recommendations.push('All documents must be checked for authenticity before approval.');
        } else {
            verificationStatus = 'ISSUES_FOUND';
            if (!mockApiFetch.marriageAPI.success) recommendations.push('Marriage record not found in Registrar database.');
            if (!isIntercaste) recommendations.push('Not a genuine inter-caste marriage.');
        }
        setVerificationData({
            ...mockApiFetch,
            recommendations,
            verificationStatus
        });
        setVerificationState('SUCCESS');
    };

    // Authority action handlers
    const handleApprove = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setActionResult('Application Approved. Incentive will be processed for genuine inter-caste marriage.');
        setIsLoading(false);
    };
    const handleReject = async () => {
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setActionResult('Application Rejected. Not a genuine inter-caste marriage or documents do not match.');
        setIsLoading(false);
    };

    return (
        <div className="bg-gradient-to-br from-slate-100 to-blue-50 min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <Link to="/authority/dashboard" className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600 mb-6">
                    <ArrowLeft size={16} className="mr-2" /> Back to Dashboard
                </Link>
                <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Information Panel */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-xl border border-slate-200">
                        <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-800">Marriage Incentive Review</h1>
                                <p className="text-slate-500 font-mono">ID: {applicationData.applicationId}</p>
                            </div>
                            {verificationData && (
                                <span className={`px-4 py-1 rounded-full text-xs font-semibold ml-4 ${verificationData.verificationStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' : verificationData.verificationStatus === 'ISSUES_FOUND' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    Status: {verificationData.verificationStatus}
                                </span>
                            )}
                        </div>
                        <div className="p-6 space-y-8">
                            {/* Details */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-700 mb-2">Applicant Details</h3>
                                    <p><strong>Name:</strong> {applicationData.applicant.name} | <strong>Category:</strong> {applicationData.applicant.category}</p>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-700 mb-2">Spouse Details (Submitted)</h3>
                                    <p><strong>Name:</strong> {applicationData.spouseSubmitted.name} | <strong>Category:</strong> {applicationData.spouseSubmitted.category}</p>
                                </div>
                            </div>
                            {/* Documents */}
                            <div>
                                <h3 className="font-semibold text-lg text-slate-700 mb-2">Uploaded Documents</h3>
                                <ul className="list-disc list-inside text-blue-600 space-y-1">
                                    {applicationData.documents.map(doc => <li key={doc.name}><a href={doc.url} className="underline" target="_blank" rel="noopener noreferrer">{doc.name}</a></li>)}
                                </ul>
                            </div>
                            {/* Verification Summary */}
                            {verificationState === 'SUCCESS' && verificationData && (
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 mt-4 animate-fade-in-up">
                                    <h3 className="font-semibold text-lg text-slate-800 mb-3">Verification Summary</h3>
                                    <div className="space-y-2">
                                        <VerificationCheck success={verificationData.marriageAPI.success} text="Marriage Record Found in Registrar Database" />
                                        <VerificationCheck success={applicationData.applicant.category !== applicationData.spouseSubmitted.category} text="Inter-Caste Union Confirmed" />
                                        <VerificationCheck success={verificationData.verificationStatus === 'VERIFIED'} text={verificationData.verificationStatus === 'VERIFIED' ? 'Eligible for Incentive' : 'Not Eligible for Incentive'} />
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="font-semibold text-slate-700 mb-2">System Recommendations:</h4>
                                        <ul className="list-disc list-inside text-slate-600 text-sm space-y-1">
                                            {verificationData.recommendations?.map((rec, idx) => <li key={idx}>{rec}</li>)}
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Right: Action Panel */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-xl border border-slate-200 sticky top-8">
                            <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800">System Verification</h2></div>
                            <div className="p-6">
                                {verificationState === 'IDLE' && (
                                    <button onClick={handleFetchVerification} className="w-full flex justify-center items-center bg-blue-600 text-white py-2.5 rounded-md font-semibold hover:bg-blue-700">
                                        <Server className="mr-2" size={16} /> Fetch from Marriage Registrar API
                                    </button>
                                )}
                                {verificationState === 'FETCHING' && (
                                    <div className="flex flex-col items-center text-center text-slate-500">
                                        <LoaderCircle className="animate-spin h-8 w-8" /><p className="mt-2 text-sm font-semibold">Verifying records...</p>
                                    </div>
                                )}
                                {verificationState === 'SUCCESS' && verificationData && (
                                    <div className="space-y-3 animate-fade-in-up">
                                        <h4 className="font-semibold text-slate-800">Verification Complete</h4>
                                        <VerificationCheck success={verificationData.marriageAPI.success} text="Marriage Record Found" />
                                        <VerificationCheck success={applicationData.applicant.category !== applicationData.spouseSubmitted.category} text="Inter-Caste Union Confirmed" />
                                        <VerificationCheck success={verificationData.verificationStatus === 'VERIFIED'} text={verificationData.verificationStatus === 'VERIFIED' ? 'Eligible for Incentive' : 'Not Eligible for Incentive'} />
                                        <p className="text-xs text-slate-500 pt-2 border-t"><strong>Officer Task:</strong> Approve only if all details and documents match and union is genuine.</p>
                                    </div>
                                )}
                                {actionResult && (
                                    <div className={`mt-6 p-4 rounded-md text-center font-semibold ${actionResult.startsWith('Application Approved') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{actionResult}</div>
                                )}
                            </div>
                            {verificationState === 'SUCCESS' && (
                                <div className="p-6 border-t border-slate-200 animate-fade-in-up">
                                    <h2 className="text-xl font-bold text-slate-800 mb-4">Take Action</h2>
                                    <form onSubmit={e => e.preventDefault()} className="space-y-4">
                                        <textarea
                                            className="w-full border border-slate-300 rounded-md p-2 text-sm"
                                            rows={3}
                                            placeholder="Remarks (required for rejection, optional for approval)"
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            required={!!(actionResult && actionResult.startsWith('Application Rejected'))}
                                        />
                                        <div className="flex flex-col space-y-2">
                                            <button
                                                type="button"
                                                disabled={isLoading || !(verificationData && verificationData.marriageAPI.success && applicationData.applicant.category !== applicationData.spouseSubmitted.category)}
                                                onClick={handleApprove}
                                                className="w-full bg-emerald-600 text-white font-semibold py-2 rounded-md hover:bg-emerald-700 disabled:bg-slate-300 transition-all"
                                            >
                                                {isLoading ? 'Processing...' : 'Approve Application'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isLoading}
                                                onClick={handleReject}
                                                className="w-full bg-red-600 text-white font-semibold py-2 rounded-md hover:bg-red-700 disabled:bg-slate-300 transition-all"
                                            >
                                                {isLoading ? 'Processing...' : 'Reject Application'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </aside>
                </main>
            </div>
        </div>
    );
};

export default MarriageReviewPage;