import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Banknote, ArrowLeft } from 'lucide-react';
import applicationService from '../../services/applicationService';

// --- CONFIGURATION for Statuses and Actors ---
type TimelineEvent = {
    title?: string;
    stage?: string;
    status?: string;
    date?: string;
    timestamp?: string;
    remarks?: string;
    description?: string;
};

type AssignedOfficer = { id?: string; name?: string } | string | null;
type Payment = { id?: string; amount?: number; method?: string; status?: string; date?: string };

type TimelineResponse = {
    applicationId: string;
    applicationType?: string;
    applicationReason?: string;
    currentStatus: string;
    beneficiaryName?: string;
    timeline?: TimelineEvent[];
    assignedOfficer?: AssignedOfficer;
    approvedAmount?: number;
    payments?: Payment[];
};

type DisplayEvent = {
    title: string;
    status: string;
    timestamp?: string;
    remarks?: string;
};

const statusConfig: Record<string, { label: string; progress: number; isError?: boolean }> = {
    SUBMITTED: { label: 'Submitted', progress: 10 },
    ASSIGNED_TO_OFFICER: { label: 'Assigned', progress: 25 },
    UNDER_REVIEW: { label: 'Under Review', progress: 50 },
    APPROVED: { label: 'Approved', progress: 75 },
    PAYMENT_INITIATED: { label: 'Payment Initiated', progress: 90 },
    PAYMENT_COMPLETED: { label: 'Completed', progress: 100 },
    REJECTED: { label: 'Rejected', progress: 100, isError: true },
};

// --- Main Application Timeline Page Component ---
const ApplicationTimelinePage: React.FC = () => {
    const { applicationId } = useParams<{ applicationId: string }>();
    const [timelineData, setTimelineData] = useState<TimelineResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;
        const loadTimeline = async () => {
            if (!applicationId) {
                setError('Application ID is required');
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await applicationService.getApplicationTimeline(applicationId) as TimelineResponse;
                console.log("Fetched timeline data:", data);
                if (mounted) setTimelineData(data || null);
            } catch (err: unknown) {
                let msg = 'Failed to load timeline';
                if (typeof err === 'object' && err !== null) {
                    const e = err as { response?: { data?: { message?: string } } };
                    msg = e.response?.data?.message || msg;
                }
                if (mounted) setError(msg);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        loadTimeline();
        return () => { mounted = false; };
    }, [applicationId]);

    // Normalize backend response shape to the UI-friendly `display` object
    const display = timelineData ? {
        applicationId: timelineData.applicationId || applicationId,
    applicationType: timelineData.applicationType || 'UNKNOWN',
    applicationReason: timelineData.applicationReason || timelineData.applicationReason || '',
        currentStatus: timelineData.currentStatus || 'UNKNOWN',
    submittedBy: timelineData.beneficiaryName || '-',
        // Use the first raw timeline event date as submissionDate when available
        submissionDate: Array.isArray(timelineData.timeline) && timelineData.timeline.length > 0 ? (timelineData.timeline[0].date || timelineData.timeline[0].timestamp) : undefined,
        assignedOfficer: timelineData.assignedOfficer,
        approvedAmount: timelineData.approvedAmount || 0,
    payments: timelineData.payments || [],
        // Normalize timeline events to expected fields: stage/status/date/description
        timeline: Array.isArray(timelineData.timeline) ? timelineData.timeline.map((ev: TimelineEvent) : DisplayEvent => ({
            title: ev.stage || ev.status || ev.title || 'Update',
            status: ev.status || 'UNKNOWN',
            timestamp: ev.date || ev.timestamp,
            remarks: ev.description || ev.remarks || ''
        })) : [] as DisplayEvent[]
    } : { // fallback
        applicationId: applicationId,
        applicationType: 'UNKNOWN',
        currentStatus: 'UNKNOWN',
        submittedBy: '-',
        submissionDate: undefined,
        assignedOfficer: undefined,
        approvedAmount: 0,
        timeline: []
    };

    const currentStatusInfo = statusConfig[display.currentStatus as keyof typeof statusConfig] || { label: 'Unknown', progress: 0 };

    return (
        <div className="bg-slate-50 min-h-screen">
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link to="/profile" className="flex items-center text-sm font-medium text-slate-600 hover:text-blue-600">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to My Applications
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* --- Left Column: Status Summary --- */}
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md border border-slate-200 sticky top-8">
                            <div className="p-6 border-b border-slate-200">
                                <p className="text-sm text-slate-500">Application ID</p>
                                <h1 className="text-2xl font-bold text-slate-800 font-mono">{display.applicationId}</h1>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <p className="text-sm font-medium text-slate-500">Application Type</p>
                                    <p className="text-slate-800 font-semibold">{display.applicationType}</p>
                                    {display.applicationReason && <p className="text-xs text-slate-500 mt-1">{display.applicationReason}</p>}
                                </div>
                                <hr />
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Current Status</p>
                                    <p className={`text-xl font-bold ${currentStatusInfo.isError ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {currentStatusInfo.label}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-500 mb-2">Progress</p>
                                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                                        <div className={`${currentStatusInfo.isError ? 'bg-red-500' : 'bg-emerald-500'} h-2.5 rounded-full`} style={{ width: `${currentStatusInfo.progress}%` }}></div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Submitted By</p>
                                        <p className="text-slate-800 font-semibold">{display.submittedBy || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Submission Date</p>
                                        <p className="text-slate-800 font-semibold">{display.submissionDate ? new Date(display.submissionDate).toLocaleDateString() : '-'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Beneficiary</p>
                                        <p className="text-slate-800">{display.submittedBy}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Assigned Officer</p>
                                        <p className="text-slate-800">{display.assignedOfficer ? (typeof display.assignedOfficer === 'string' ? display.assignedOfficer : (display.assignedOfficer.name || 'Not assigned')) : 'Not assigned'}</p>
                                    </div>
                                </div>
                                {display.approvedAmount > 0 && (
                                     <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center space-x-3">
                                        <Banknote className="h-8 w-8 text-blue-600 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-800">Approved Amount</p>
                                            <p className="text-xl font-bold text-blue-900">₹{display.approvedAmount.toLocaleString('en-IN')}</p>
                                        </div>
                                    </div>
                                )}
                                {Array.isArray(display.payments) && display.payments.length > 0 && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                        <p className="text-sm font-medium text-emerald-700">Payments</p>
                                        <p className="text-sm text-emerald-900">{display.payments.length} transaction(s)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* --- Right Column: Detailed Timeline --- */}
                    <div className="lg:col-span-2">
                         <div className="bg-white rounded-lg shadow-md border border-slate-200">
                            <div className="p-6 border-b border-slate-200">
                                <h2 className="text-xl font-bold text-slate-800">Application History</h2>
                            </div>
                            <div className="p-6 lg:p-8">
                                {/* Stepper showing full workflow with completed/current/upcoming steps */}
                                {(() => {
                                    const orderedSteps = ['SUBMITTED','ASSIGNED_TO_OFFICER','UNDER_REVIEW','APPROVED','PAYMENT_INITIATED','PAYMENT_COMPLETED'];
                                    // helper to find a matching timeline event for a given step
                                    const findEventForStep = (stepKey: string): TimelineEvent | undefined => {
                                        const info = statusConfig[stepKey as keyof typeof statusConfig] || { label: stepKey.replace('_',' '), progress: 0 };
                                        const needle = (info.label || '').toString().toLowerCase();
                                        const rawTimeline = Array.isArray(timelineData?.timeline) ? timelineData!.timeline! : [];
                                        return rawTimeline.find((ev: TimelineEvent) => {
                                            const title = (ev.title || ev.stage || '').toString().toLowerCase();
                                            const status = (ev.status || '').toString().toLowerCase();
                                            const desc = (ev.remarks || ev.description || '').toString().toLowerCase();
                                            return title.includes(needle) || status === stepKey.toLowerCase() || desc.includes(needle);
                                        });
                                    };

                                    return (
                                        <div className="mb-6">
                                            <div className="flex flex-col space-y-6">
                                                {orderedSteps.map((s, idx) => {
                                                    const info = statusConfig[s as keyof typeof statusConfig] || { label: s.replace(/_/g,' '), progress: 0 };
                                                    const isActive = s === display.currentStatus;
                                                    const matchedEvent = findEventForStep(s);
                                                    const badgeClass = isActive ? (info.isError ? 'bg-red-500 text-white' : 'bg-blue-600 text-white') : (idx < orderedSteps.indexOf(display.currentStatus) ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200');

                                                    return (
                                                        <div key={s} className={`flex items-start space-x-4 ${isActive ? '' : 'opacity-60'}`}>
                                                            <div className="flex flex-col items-center">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${badgeClass}`}>
                                                                    {isActive ? <span className="text-sm">{idx+1}</span> : (idx < orderedSteps.indexOf(display.currentStatus) ? <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg> : <span className="text-xs">{idx+1}</span>)}
                                                                </div>
                                                                {idx < orderedSteps.length - 1 && (
                                                                    <div className={`w-px ${idx < orderedSteps.indexOf(display.currentStatus) ? 'bg-emerald-200' : 'bg-slate-200'} h-6 mt-2`} />
                                                                )}
                                                            </div>

                                                            <div className="flex-1">
                                                                <div className={`flex items-center justify-between`}> 
                                                                    <div>
                                                                        <div className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-500'}`}>{info.label}</div>
                                                                        <div className="text-xs text-slate-400">{isActive ? (info.isError ? 'Error' : 'In progress') : (idx < orderedSteps.indexOf(display.currentStatus) ? 'Done' : 'Pending')}</div>
                                                                    </div>
                                                                </div>

                                                                {/* Show details only for the active/current step */}
                                                                {isActive && (
                                                                    <div className={`mt-3 p-4 rounded-lg border bg-white border-slate-200 shadow-sm`}> 
                                                                        <div className="flex items-start justify-between">
                                                                            <div>
                                                                                <h4 className="font-semibold text-slate-900 text-lg">{(matchedEvent?.stage || matchedEvent?.title || info.label).toString().replace(/_/g,' ')}</h4>
                                                                                <p className="text-sm text-slate-500 mt-1">{info.label} — {matchedEvent?.status || ''}</p>
                                                                            </div>
                                                                            <div>
                                                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${matchedEvent?.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : matchedEvent?.status === 'REJECTED' || info.isError ? 'bg-red-100 text-red-800' : 'bg-blue-50 text-blue-800'}`}>{(matchedEvent?.status || (info.isError ? 'ERROR' : 'IN_PROGRESS'))}</span>
                                                                            </div>
                                                                        </div>

                                                                        <time className="block mt-3 text-sm text-slate-400">{matchedEvent?.date ? new Date(matchedEvent.date).toLocaleString() : (matchedEvent?.timestamp ? new Date(matchedEvent.timestamp).toLocaleString() : '—')}</time>
                                                                        <p className="text-slate-700 mt-3">{matchedEvent?.description || matchedEvent?.remarks || 'No additional details provided.'}</p>

                                                                        {/* Previous updates (compact) */}
                                                                        {Array.isArray(display.timeline) && display.timeline.length > 0 && (
                                                                            <div className="mt-4">
                                                                                <h5 className="text-sm font-medium text-slate-700 mb-2">Previous updates</h5>
                                                                                <ul className="space-y-2 text-sm text-slate-600">
                                                                                    {display.timeline.filter(ev => (ev.timestamp || ev.remarks)).slice().reverse().map((ev, i) => (
                                                                                        <li key={i} className="flex items-start space-x-3">
                                                                                            <div className="w-2.5 h-2.5 mt-2 rounded-full bg-slate-300 flex-shrink-0" />
                                                                                            <div>
                                                                                                <div className="text-xs text-slate-500">{ev.timestamp ? new Date(ev.timestamp).toLocaleString() : '—'}</div>
                                                                                                <div className="text-sm text-slate-700">{ev.title}</div>
                                                                                                {ev.remarks && <div className="text-xs text-slate-500">{ev.remarks}</div>}
                                                                                            </div>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="mt-2 text-xs text-slate-500">Only the current step shows details; other steps are disabled/summary-only.</div>
                                        </div>
                                    );
                                })()}

                                {loading ? (
                                    <div className="text-sm text-slate-600">Loading timeline...</div>
                                ) : error ? (
                                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md">{error}</div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ApplicationTimelinePage;