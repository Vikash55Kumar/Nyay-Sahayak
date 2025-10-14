import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Hourglass, ArrowRight } from 'lucide-react';
import applicationService from '../../services/applicationService';

const mockApplications = [
    {
        applicationId: "MAR_2025_184592",
        applicationType: "INTERCASTE_MARRIAGE",
        status: "APPROVED",
        submissionDate: "2025-10-10T10:00:00.000Z",
        lastUpdated: "2025-10-12T15:30:00.000Z",
    },
    {
        applicationId: "ATR_2025_987654",
        applicationType: "ATROCITY_RELIEF",
        status: "SUBMITTED",
        submissionDate: "2025-10-13T11:00:00.000Z",
        lastUpdated: "2025-10-13T11:00:00.000Z",
    },
    {
        applicationId: "MAR_2024_123456",
        applicationType: "INTERCASTE_MARRIAGE",
        status: "REJECTED",
        submissionDate: "2024-08-01T09:00:00.000Z",
        lastUpdated: "2024-08-05T17:00:00.000Z",
        remarks: "Spouse caste certificate was not valid."
    }
];

const statusConfig = {
    SUBMITTED: { icon: Hourglass, color: 'text-amber-500', bgColor: 'bg-amber-50' },
    APPROVED: { icon: CheckCircle, color: 'text-emerald-500', bgColor: 'bg-emerald-50' },
    REJECTED: { icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' },
    UNDER_REVIEW: { icon: Clock, color: 'text-blue-500', bgColor: 'bg-blue-50' },
};

const MyApplicationsPage: React.FC = () => {
    const [applications, setApplications] = useState<typeof mockApplications>(mockApplications);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await applicationService.getMyApplications();
                // expecting data to be an array of applications
                if (mounted && Array.isArray(data) && data.length > 0) {
                    setApplications(data as any);
                }
            } catch (err) {
                // keep mock data if fetch fails
                const msg = (err as any)?.response?.data?.message || 'Failed to load applications';
                setError(msg);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();
        return () => { mounted = false; };
    }, []);

    return (
        <div className="bg-slate-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <main className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800">My Applications</h1>
                    <Link to="/dashboard">
                        <button className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-sm hover:shadow-md">
                            <span>Apply for New Scheme</span>
                        </button>
                    </Link>
                </div>

                {loading && (
                    <div className="text-sm text-slate-600 mb-4">Loading applications...</div>
                )}

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md mb-4">{error}</div>
                )}

                <div className="space-y-6">
                    {applications.map((app: any) => {
                        const config = statusConfig[app.status as keyof typeof statusConfig] || statusConfig.SUBMITTED;
                        return (
                            <div key={app.applicationId} className="bg-white rounded-lg shadow-md border border-slate-200 hover:shadow-lg transition-shadow">
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                                    <div className="flex items-center space-x-4 sm:col-span-2">
                                        <FileText className="h-10 w-10 text-slate-400 flex-shrink-0" />
                                        <div>
                                            <p className="font-bold text-slate-800 font-mono">{app.applicationId}</p>
                                            <p className="text-sm text-slate-500">{(app.applicationType || app.type || '').toString().replace('_', ' ')}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center">
                                        <div className={`flex items-center space-x-2 px-3 py-1 ${config.bgColor} ${config.color} rounded-full text-sm font-medium`}>
                                            <config.icon size={16} />
                                            <span>{app.status}</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Link to={`/application/${app.applicationId}`} className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-200 transition-all flex items-center space-x-2">
                                            <span>Track Status</span>
                                            <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </div>
                                {app.remarks && (
                                    <div className="px-6 pb-4 border-t border-slate-100 pt-4">
                                        <p className="text-sm text-slate-600"><strong>Remarks:</strong> {app.remarks}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default MyApplicationsPage;