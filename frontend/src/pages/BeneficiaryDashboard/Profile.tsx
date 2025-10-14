import React, { useState, useEffect } from 'react';
import { User, FileText, Landmark, Settings, LogOut, ShieldCheck, Mail, Phone, Edit3, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { Link } from 'react-router-dom';
import MyApplicationsPage from './MyApplicationsPage';
import photo from '../../assets/photo.jpeg';

// Minimal types for profile data returned by backend
interface Address {
    careOf?: string;
    street?: string;
    village?: string;
    postOffice?: string;
    district?: string;
    state?: string;
    pincode?: string;
}

interface CasteDetails {
    caste?: string;
    category?: string;
    verificationStatus?: string;
    verificationMethod?: string;
}

interface BankDetails {
    accountHolder?: string;
    bankName?: string;
    branchName?: string;
    accountNumber?: string;
    ifsc?: string;
}

interface ProfileData {
    id?: string;
    fullName?: string;
    profileStatus?: string;
    address?: Address;
    aadhaarData?: { gender?: string; photoUrl?: string; mobileNumber?: string; email?: string };
    casteDetails?: CasteDetails;
    bankDetails?: BankDetails;
    createdAt?: string;
    updatedAt?: string;
    dob?: string;
    gender?: string;
    email?: string;
}

// --- Helper Components ---

interface InfoCardProps {
    title: string;
    children: React.ReactNode;
    actionButton?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, children, actionButton }) => (
    <div className="bg-white rounded-lg shadow-md border border-slate-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            {actionButton}
        </div>
        <div className="p-6 space-y-4">
            {children}
        </div>
    </div>
);

interface DetailItemProps {
    label: string;
    value: string | React.ReactNode;
    isVerified?: boolean;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, isVerified = false }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div className="flex items-center space-x-2">
            <p className="text-base text-slate-800">{value}</p>
            {isVerified && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
        </div>
    </div>
);

const UserProfilePage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'applications' | 'bank' | 'documents' | 'settings'>('profile');
    const { user, logout } = useAuth();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            setLoading(true);
            try {
                const resUnknown: unknown = await authService.getCurrentUser();
                if (!mounted) return;
                // backend may return { user, profile } or directly profile object
                type PossiblePayload = { profile?: ProfileData } | { user?: { profile?: ProfileData } } | ProfileData;
                const payload = resUnknown as PossiblePayload;
                const hasProfile = (p: PossiblePayload): p is { profile: ProfileData } => typeof p === 'object' && p !== null && 'profile' in (p as object) && typeof ((p as { profile?: unknown }).profile) !== 'undefined';
                const hasUserWithProfile = (p: PossiblePayload): p is { user: { profile: ProfileData } } => typeof p === 'object' && p !== null && 'user' in (p as object) && typeof ((p as { user?: { profile?: unknown } }).user?.profile) !== 'undefined';
                let profile: ProfileData | null = null;
                if (hasProfile(payload)) profile = payload.profile!;
                else if (hasUserWithProfile(payload)) profile = payload.user.profile!;
                else profile = payload as ProfileData;
                setProfileData(profile ?? null);
            } catch (err: unknown) {
                let message = 'Failed to load profile';
                if (typeof err === 'object' && err !== null && 'message' in err) message = (err as { message?: string }).message ?? message;
                console.error('Failed to load profile', err);
                setError(message);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        load();
        return () => { mounted = false; };
    }, []);

    // --- Sidebar Navigation ---
    type ProfileTab = 'profile' | 'applications' | 'bank' | 'documents' | 'settings';
    const sidebarLinks: { id: ProfileTab; name: string; icon: React.ComponentType<Record<string, unknown>> }[] = [
        { id: 'profile', name: 'My Profile', icon: User },
        { id: 'applications', name: 'My Applications', icon: FileText },
        { id: 'bank', name: 'Bank Details', icon: Landmark },
        { id: 'settings', name: 'Settings', icon: Settings },
    ];
    
    return (
        <div className="bg-slate-50 min-h-screen">
            {loading && (
                <div className="max-w-7xl mx-auto py-6 px-4 text-center text-slate-600">Loading profile...</div>
            )}
            {error && (
                <div className="max-w-7xl mx-auto py-6 px-4 text-center text-red-600">{error}</div>
            )}
            {/* Assuming a Navbar component exists above this page */}
            
            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    {/* --- Left Sidebar --- */}
                    <aside className="md:col-span-1">
                        <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 flex flex-col items-center text-center">
                            <img 
                                src={photo}
                                alt="User Profile"
                                className="h-24 w-24 rounded-full object-cover border-4 border-slate-200"
                            />
                            <h2 className="mt-4 text-xl font-bold text-slate-800">{profileData?.fullName ?? 'User'}</h2>
                            <div className="mt-2 flex items-center space-x-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                                <ShieldCheck size={16}/>
                                <span>Verified Profile</span>
                            </div>
                        </div>

                        <nav className="mt-6 bg-white rounded-lg shadow-md border border-slate-200 p-4 space-y-1">
                            {sidebarLinks.map(link => (
                                <button
                                    key={link.id}
                                    onClick={() => setActiveTab(link.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-left font-medium transition-colors
                                        ${activeTab === link.id 
                                            ? 'bg-blue-600 text-white shadow-sm' 
                                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
                                    `}
                                >
                                    <link.icon size={20} />
                                    <span>{link.name}</span>
                                </button>
                            ))}
                             <button className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-md text-left font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900" onClick={() => logout()}>
                                <LogOut size={20} />
                                <span>Logout</span>
                            </button>
                        </nav>
                    </aside>
                    
                    {/* --- Right Content Area --- */}
                    <div className="md:col-span-3 space-y-8">
                        {/* Conditional rendering based on active tab */}
                        
                        {activeTab === 'profile' && (
                            <>
                                <div className="bg-white rounded-lg shadow-md border border-slate-200 p-6 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-800">Welcome, {profileData?.fullName ?? 'User'}!</h2>
                                        <p className="text-slate-500 mt-1">Review your profile or start a new application.</p>
                                    </div>
                                    <Link to="/dashboard">
                                        <button className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 shadow-sm hover:shadow-md">
                                            <span>Apply for New Scheme</span>
                                            <ArrowRight size={18}/>
                                        </button>
                                    </Link>
                                </div>
                                
                                <InfoCard 
                                    title="Personal Information"
                                    actionButton={<span className="text-xs font-medium text-slate-500">Verified via Aadhaar</span>}
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                        <DetailItem label="Full Name" value={profileData?.fullName} isVerified />
                                        <DetailItem label="Date of Birth" value={profileData?.dob ? profileData.dob.split('T')[0] : '-'} isVerified />
                                        <DetailItem label="Gender" value={profileData?.aadhaarData?.gender ?? profileData?.gender ?? '-'} isVerified />
                                        <DetailItem label="Address" value={
                                            profileData?.address ? (
                                                `${profileData.address.street}, ${profileData.address.village}, ${profileData.address.district}`
                                            ) : '-'
                                        } isVerified />
                                        <DetailItem label="State" value={profileData?.address?.state ?? '-'} isVerified />
                                        <DetailItem label="Pincode" value={profileData?.address?.pincode ?? '-'} isVerified />
                                    </div>
                                </InfoCard>
                                
                                <InfoCard 
                                    title="Contact & Caste Details"
                                    actionButton={
                                        <button className="text-sm font-medium text-blue-600 hover:underline flex items-center space-x-1">
                                            <Edit3 size={14}/>
                                            <span>Edit Contact</span>
                                        </button>
                                    }
                                >
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                        <DetailItem label="Mobile Number" value={<><Phone size={14} className="inline mr-2"/>{user?.profile?.mobileNumber ?? profileData?.aadhaarData?.mobileNumber ?? '-'}</>} isVerified />
                                        <DetailItem label="Email Address" value={<><Mail size={14} className="inline mr-2"/>{user?.email ?? profileData?.email ?? '-'}</>} />
                                        <DetailItem 
                                            label="Category" 
                                            value={<span className="font-bold">{profileData?.casteDetails?.category ?? '-'}</span>} 
                                            isVerified={profileData?.casteDetails?.verificationStatus === 'VERIFIED'} 
                                        />
                                        <DetailItem 
                                            label="Caste" 
                                            value={profileData?.casteDetails?.caste ?? '-'} 
                                            isVerified={profileData?.casteDetails?.verificationStatus === 'VERIFIED'} 
                                        />
                                        <DetailItem 
                                            label="Verification Method" 
                                            value={
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                    profileData?.casteDetails?.verificationMethod === 'DIGILOCKER' ? 'bg-blue-100 text-blue-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {profileData?.casteDetails?.verificationMethod ?? (profileData?.casteDetails ? 'DIGILOCKER' : '-')}
                                                </span>
                                            }
                                        />
                                         <DetailItem 
                                            label="Caste Status" 
                                            value={
                                                <span className={`font-semibold ${
                                                    profileData?.casteDetails?.verificationStatus === 'VERIFIED' ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                    {(profileData?.casteDetails?.verificationStatus ?? '').replace('_', ' ') || '-'}
                                                </span>
                                            }
                                        />
                                    </div>
                                </InfoCard>
                            </>
                        )}
                        
                        {activeTab === 'applications' && (
                             <InfoCard title="My Applications">
                                {/* <p className="text-slate-500 text-center py-12">No applications found. You can start a new application from your profile.</p>
                             
                              */}
                             <MyApplicationsPage />
                             </InfoCard>
                        )}

                        {activeTab === 'bank' && (
                             <InfoCard title="Bank Account Details">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                    <DetailItem label="Account Holder Name" value={profileData?.bankDetails?.accountHolder ?? '-'} isVerified />
                                    <DetailItem label="Bank Name" value={profileData?.bankDetails?.bankName ?? '-'} />
                                    <DetailItem label="Account Number" value={profileData?.bankDetails?.accountNumber ? profileData.bankDetails.accountNumber : '-'} />
                                    <DetailItem label="IFSC Code" value={profileData?.bankDetails?.ifsc ?? '-'} />
                                </div>
                             </InfoCard>
                        )}

                        {activeTab === 'settings' && (
                             <InfoCard title="Account Settings">
                                <p className="text-slate-500 text-center py-12">Settings section is under development.</p>
                             </InfoCard>
                        )}

                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfilePage;