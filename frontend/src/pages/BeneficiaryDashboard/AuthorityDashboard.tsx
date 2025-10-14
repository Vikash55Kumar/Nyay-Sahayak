// Filename: pages/AuthorityDashboardPage.tsx
// A unified, role-based dashboard for all government officials.

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, ShieldCheck, Heart, FileWarning, Search, Filter, Bell } from 'lucide-react';

// --- MOCK DATA (Simulating data for different authority roles) ---

const pendingRegistrations = [
    { id: 'REG_001', fullName: "Raju Lal", caste: "Meghwal", category: "SC", submissionDate: "2025-10-13T09:00:00Z", verificationMethod: "MANUAL_UPLOAD" },
    { id: 'REG_002', fullName: "Santosh Kumari", caste: "Garasia", category: "ST", submissionDate: "2025-10-12T14:30:00Z", verificationMethod: "MANUAL_UPLOAD" },
];

const pendingMarriageApps = [
    { id: 'APP_001', applicationId: "MAR_2025_184592", applicantName: "Priya Kumari", spouseName: "Suresh Kumar", submissionDate: "2025-10-11T16:20:00Z", status: "SUBMITTED" },
    { id: 'APP_002', applicationId: "MAR_2025_184593", applicantName: "Sunita Bai", spouseName: "Mohan Lal", submissionDate: "2025-10-10T11:00:00Z", status: "SUBMITTED" },
];

const pendingAtrocityApps = [
    { id: 'APP_003', applicationId: "ATR_2025_987654", applicantName: "Raju Lal", firNumber: "0129/2025", district: "Jodhpur Rural", submissionDate: "2025-10-13T12:00:00Z", status: "SUBMITTED" },
    { id: 'APP_004', applicationId: "ATR_2025_987655", applicantName: "Kamla Devi", firNumber: "0255/2025", district: "Pali", submissionDate: "2025-10-12T18:45:00Z", status: "SUBMITTED" },
];

// --- Type Definitions ---
type OfficerRole = 'DISTRICT_OFFICER' | 'DLO_MARRIAGE' | 'ATROCITY_OFFICER';

interface Officer {
    name: string;
    role: OfficerRole;
    title: string;
}

// --- Reusable Stat Card Component ---
const StatCard = ({ title, value, icon: Icon }: { title: string, value: string | number, icon: React.ElementType }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-3xl font-bold text-slate-800">{value}</p>
            </div>
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
                <Icon size={24} />
            </div>
        </div>
    </div>
);

// --- Main Authority Dashboard Component ---

const AuthorityDashboardPage: React.FC = () => {
    // Simulate logged-in user state
    const [currentRole, setCurrentRole] = useState<OfficerRole>('DISTRICT_OFFICER');

    // MOCK OFFICER PROFILES
    const officerProfiles: Record<OfficerRole, Officer> = {
        DISTRICT_OFFICER: { name: "Mr. Sharma", role: 'DISTRICT_OFFICER', title: "District Officer" },
        DLO_MARRIAGE: { name: "Mrs. Singh", role: 'DLO_MARRIAGE', title: "DLO (Marriage Verification)" },
        ATROCITY_OFFICER: { name: "Mr. Verma", role: 'ATROCITY_OFFICER', title: "Atrocity Relief Officer" },
    };

    const officer = officerProfiles[currentRole];

    // Dynamic content based on the selected role
    const dashboardContent = useMemo(() => {
        switch (currentRole) {
            case 'DISTRICT_OFFICER':
                return {
                    title: "Beneficiary Registration Verification",
                    stats: [
                        { title: "Pending Registrations", value: pendingRegistrations.length, icon: User },
                        { title: "Verified This Month", value: 18, icon: ShieldCheck },
                    ],
                    tableData: pendingRegistrations,
                    tableColumns: [ 'Beneficiary Name', 'Caste Details', 'Submission Date', 'Method', 'Action' ],
                };
            case 'DLO_MARRIAGE':
                return {
                    title: "Inter-Caste Marriage Applications",
                    stats: [
                        { title: "Pending Applications", value: pendingMarriageApps.length, icon: Heart },
                        { title: "Approved This Month", value: 7, icon: ShieldCheck },
                    ],
                    tableData: pendingMarriageApps,
                    tableColumns: [ 'Application ID', 'Applicant Name', 'Spouse Name', 'Submission Date', 'Action' ],
                };
            case 'ATROCITY_OFFICER':
                return {
                    title: "Atrocity Relief Applications",
                    stats: [
                        { title: "Pending Applications", value: pendingAtrocityApps.length, icon: FileWarning },
                        { title: "Processed This Month", value: 12, icon: ShieldCheck },
                    ],
                    tableData: pendingAtrocityApps,
                    tableColumns: [ 'Application ID', 'Applicant Name', 'FIR Number', 'District', 'Action' ],
                };
        }
    }, [currentRole]);

    return (
        <div className="bg-slate-50 min-h-screen">
            <header className="bg-white shadow-sm border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-12" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-800">Authority Portal</h1>
                            <p className="text-xs text-slate-500">Government of Rajasthan</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Bell className="text-slate-500" />
                        <div className="text-right">
                            <p className="font-semibold text-slate-800">{officer.name}</p>
                            <p className="text-xs text-slate-500">{officer.title}</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* --- DEMO ROLE SWITCHER --- */}
                <div className="mb-6 p-3 bg-amber-100 border border-amber-200 rounded-lg flex items-center justify-center space-x-2 text-sm">
                    <p className="font-semibold text-amber-800">Demo Controls:</p>
                    <select value={currentRole} onChange={(e) => setCurrentRole(e.target.value as OfficerRole)} className="bg-white border-slate-300 rounded-md shadow-sm">
                        <option value="DISTRICT_OFFICER">District Officer View</option>
                        <option value="DLO_MARRIAGE">DLO (Marriage) View</option>
                        <option value="ATROCITY_OFFICER">Atrocity Officer View</option>
                    </select>
                </div>
                
                <h2 className="text-3xl font-bold text-slate-800 mb-6">{dashboardContent.title}</h2>
                
                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {dashboardContent.stats.map(stat => <StatCard key={stat.title} {...stat} />)}
                </div>

                {/* Applications Table */}
                <div className="mt-10 bg-white rounded-lg shadow-md border border-slate-200">
                    <div className="p-4 flex justify-between items-center border-b border-slate-200">
                        <h3 className="text-lg font-bold text-slate-800">Pending Queue</h3>
                        <div className="flex items-center space-x-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-md" />
                            </div>
                            <button className="flex items-center space-x-1 px-3 py-2 border rounded-md text-slate-600 hover:bg-slate-50">
                                <Filter size={16} /><span>Filter</span>
                            </button>
                        </div>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                                <tr>
                                    {dashboardContent.tableColumns.map(col => <th key={col} scope="col" className="px-6 py-3">{col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {dashboardContent.tableData.map((item: any) => (
                                    <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                                        {currentRole === 'DISTRICT_OFFICER' && <>
                                            <td className="px-6 py-4 font-medium text-slate-900">{item.fullName}</td>
                                            <td className="px-6 py-4">{item.caste} ({item.category})</td>
                                            <td className="px-6 py-4">{new Date(item.submissionDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">{item.verificationMethod}</span></td>
                                        </>}
                                         {currentRole === 'DLO_MARRIAGE' && <>
                                            <td className="px-6 py-4 font-medium text-slate-900 font-mono">{item.applicationId}</td>
                                            <td className="px-6 py-4">{item.applicantName}</td>
                                            <td className="px-6 py-4">{item.spouseName}</td>
                                            <td className="px-6 py-4">{new Date(item.submissionDate).toLocaleDateString()}</td>
                                        </>}
                                         {currentRole === 'ATROCITY_OFFICER' && <>
                                            <td className="px-6 py-4 font-medium text-slate-900 font-mono">{item.applicationId}</td>
                                            <td className="px-6 py-4">{item.applicantName}</td>
                                            <td className="px-6 py-4 font-mono">{item.firNumber}</td>
                                            <td className="px-6 py-4">{item.district}</td>
                                        </>}
                                        <td className="px-6 py-4">
                                            <Link to={`/authority/review/${item.id}`} className="font-medium text-blue-600 hover:underline">
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AuthorityDashboardPage;