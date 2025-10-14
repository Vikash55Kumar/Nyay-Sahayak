import React, { useState, useMemo } from 'react';
import { Heart, FileUp, CheckCircle, LoaderCircle, AlertTriangle, ArrowRight, ArrowLeft, Trash2, ShieldCheck, UploadCloud, Award } from 'lucide-react';
import applicationService from '../../services/applicationService';
import type { IntercasteMarriageInput } from '../../services/applicationService';
import { Link } from 'react-router-dom';

// --- MOCK DATA (Simulating a logged-in user's profile) ---
const loggedInUser = {
    fullName: "Geeta Devi",
    casteDetails: {
        category: "ST",
        caste: "Bhil Meena",
    }
};

const availableSchemes = [
    {
        id: 'DR_AMBEDKAR_SCHEME',
        title: 'Dr. Ambedkar Scheme for Social Integration',
        benefit: '₹2.5 Lakh Incentive',
        description: 'A Central Government scheme to encourage inter-caste marriages where one spouse belongs to the SC/ST category.',
        eligibility: 'One spouse must be from a Scheduled Caste or Scheduled Tribe.'
    },
    {
        id: 'RAJASTHAN_STATE_INCENTIVE',
        title: 'Rajasthan State Inter-Caste Marriage Incentive',
        benefit: '₹5.0 Lakh State Incentive',
        description: 'A scheme by the Government of Rajasthan to further promote social harmony through inter-caste marriages.',
        eligibility: 'Couple must be residents of Rajasthan.'
    }
];

// --- Helper Components ---
interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> { label: string; }
const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <input className="w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...props} />
    </div>
);

interface DetailItemProps { label: string; value: string; }
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-base text-slate-800">{value}</p>
    </div>
);

// NEW: A dedicated component for a single file upload slot
interface SingleFileUploadProps {
    label: string;
    required: boolean;
    file: File | null;
    onFileChange: (file: File | null) => void;
}
const SingleFileUpload: React.FC<SingleFileUploadProps> = ({ label, required, file, onFileChange }) => {
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            onFileChange(event.target.files[0]);
        }
    };

    const handleRemoveFile = () => {
        onFileChange(null);
        // This is needed to allow re-uploading the same file after removing it
        const input = document.getElementById(label.replace(/\s+/g, '-')) as HTMLInputElement;
        if(input) input.value = "";
    };

    return (
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {!file ? (
                <label htmlFor={label.replace(/\s+/g, '-')} className="relative flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-2 text-slate-500" />
                        <p className="text-sm text-slate-500"><span className="font-semibold">Click to upload</span></p>
                    </div>
                    <input id={label.replace(/\s+/g, '-')} type="file" className="sr-only" onChange={handleFileSelect} />
                </label>
            ) : (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                    <div className="flex items-center space-x-3">
                        <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-slate-800">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button type="button" onClick={handleRemoveFile}>
                        <Trash2 className="h-5 w-5 text-red-500 hover:text-red-700" />
                    </button>
                </div>
            )}
        </div>
    );
};

const MarriageApplicationPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ applicationId: string; message: string } | null>(null);
    const [selectedScheme, setSelectedScheme] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        marriageRegistrationId: '',
        spouseName: '',
        spouseCategory: 'GENERAL',
        spouseAadhaarNumber: '',
    });
    
    // NEW: State for specific files
    const [marriageCertFile, setMarriageCertFile] = useState<File | null>(null);
    const [spouseAadhaarFile, setSpouseAadhaarFile] = useState<File | null>(null);
    const [spouseCasteFile, setSpouseCasteFile] = useState<File | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const isSpouseCategoryInvalid = useMemo(() => {
        return loggedInUser.casteDetails.category === formData.spouseCategory;
    }, [formData.spouseCategory]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
            setError(null);
            setIsLoading(true);

            if (!marriageCertFile || !spouseAadhaarFile || !spouseCasteFile) {
                setError('Please upload all three required documents.');
                setIsLoading(false);
                return;
            }

            try {
                // Build supportingDocuments array with only names and inferred type (we're not uploading files)
                const supportingDocuments = [] as Array<{ type: string; fileName: string }>;
                if (marriageCertFile) supportingDocuments.push({ type: 'Marriage Certificate', fileName: marriageCertFile.name });
                if (spouseAadhaarFile) supportingDocuments.push({ type: 'Aadhaar Card', fileName: spouseAadhaarFile.name });
                if (spouseCasteFile) supportingDocuments.push({ type: 'Caste Certificate', fileName: spouseCasteFile.name });

                const payload = {
                    schemeId: selectedScheme || '',
                    marriageRegistrationId: formData.marriageRegistrationId,
                    spouseName: formData.spouseName,
                    spouseCategory: formData.spouseCategory,
                    spouseAadhaarNumber: formData.spouseAadhaarNumber,
                    applicantName: loggedInUser.fullName,
                    applicantCategory: loggedInUser.casteDetails.category,
                    supportingDocuments,
                    applicationReason: 'Intercaste marriage incentive application'
                };

                const res = await applicationService.submitIntercasteMarriage(payload as unknown as IntercasteMarriageInput);
                await applicationService.getMyApplications();
                const appId = (res && (res.applicationId || res.id || res._id)) ?? null;
                const message = (res && (res.message || 'Application submitted successfully')) || 'Application submitted successfully';
                setSuccessData({ applicationId: appId ?? `MAR_${new Date().getFullYear()}_${Math.floor(Math.random() * 900000) + 100000}`, message });
            } catch (err) {
                // Extract message safely
                const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit application';
                setError(msg);
            } finally {
                setIsLoading(false);
            }
    };

    if (successData) {
        // Success screen remains the same
        return (
             <div className="max-w-4xl mx-auto py-36 md:py-48 px-4 text-center">
                <CheckCircle className="mx-auto h-20 w-20 text-emerald-500" />
                <h2 className="mt-4 text-3xl font-bold text-slate-800">Application Submitted!</h2>
                <p className="mt-2 text-slate-600">{successData.message}</p>
                <p className="mt-4 font-semibold text-lg">Application ID: <span className="font-mono bg-slate-100 text-slate-800 p-2 rounded-md">{successData.applicationId}</span></p>
                <Link to='/profile'>
                    <button className="mt-8 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700">Go to My Applications</button>
                </Link>
            </div>
        )
    }

    return (
        <div className="bg-slate-50 min-h-screen">
             <main className="max-w-4xl mx-auto py-12 px-4">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800">Application for Inter-caste Marriage Incentive</h2>
                        <p className="text-slate-500 mt-1">Please fill in the details accurately. Fields marked with * are mandatory.</p>
                    </div>
                    
                    {/* Stepper */}
                    <div className="p-6 flex justify-around border-b border-slate-200">
                        {[
                            { num: 1, title: "Select Scheme", icon: Award },
                            { num: 2, title: "Spouse Details", icon: Heart },
                            { num: 3, title: "Upload Documents", icon: FileUp },
                            { num: 4, title: "Review & Submit", icon: CheckCircle }
                        ].map(item => (
                            <div key={item.num} className={`flex items-center space-x-2 ${step >= item.num ? 'text-blue-600' : 'text-slate-400'}`}>
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${step >= item.num ? 'border-blue-600 bg-blue-50' : 'border-slate-300'}`}>
                                    <item.icon size={16} />
                                </div>
                                <span className={`font-semibold hidden sm:block ${step >= item.num ? 'text-slate-800' : 'text-slate-500'}`}>{item.title}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md flex items-center text-sm">
                                <AlertTriangle className="mr-3 h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* --- NEW Step 1: Scheme Selection --- */}
                        {step === 1 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <h3 className="font-semibold text-lg text-slate-800">Please select the scheme you wish to apply for:</h3>
                                <div className="space-y-4">
                                    {availableSchemes.map(scheme => (
                                        <div
                                            key={scheme.id}
                                            onClick={() => setSelectedScheme(scheme.id)}
                                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                                selectedScheme === scheme.id ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-400'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-bold text-slate-800">{scheme.title}</h4>
                                                    <p className="text-sm text-slate-600 mt-1">{scheme.description}</p>
                                                    <p className="text-xs text-slate-500 mt-2"><strong>Eligibility:</strong> {scheme.eligibility}</p>
                                                </div>
                                                <div className="ml-4 text-center">
                                                    <p className="font-bold text-lg text-emerald-600">{scheme.benefit}</p>
                                                    {selectedScheme === scheme.id && <CheckCircle className="text-blue-600 mx-auto mt-2" />}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button type="button" onClick={() => setStep(2)} disabled={!selectedScheme} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:bg-slate-400">
                                        <span>Next: Spouse Details</span><ArrowRight size={18}/>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* --- Step 2: Spouse & Marriage Details --- */}
                        {step === 2 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                                    <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-blue-800">Your Verified Details</h3>
                                        <p className="text-sm text-blue-700">Applicant Name: <strong>{loggedInUser.fullName}</strong> | Category: <strong>{loggedInUser.casteDetails.category}</strong></p>
                                    </div>
                                </div>
                                <FormInput label="Marriage Registration ID *" name="marriageRegistrationId" value={formData.marriageRegistrationId} onChange={handleInputChange} required />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput label="Spouse's Full Name *" name="spouseName" value={formData.spouseName} onChange={handleInputChange} required />
                                    <FormInput label="Spouse's Aadhaar Number *" name="spouseAadhaarNumber" value={formData.spouseAadhaarNumber} onChange={handleInputChange} maxLength={12} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Spouse's Caste Category *</label>
                                    <select name="spouseCategory" value={formData.spouseCategory} onChange={handleInputChange} className="w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                        <option value="GENERAL">General</option>
                                        <option value="OBC">Other Backward Class (OBC)</option>
                                        <option value="SC">Scheduled Caste (SC)</option>
                                        <option value="ST">Scheduled Tribe (ST)</option>
                                    </select>
                                    {isSpouseCategoryInvalid && <p className="text-sm text-red-600 mt-1">Spouse category cannot be the same as yours for this scheme.</p>}
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="bg-slate-200 text-slate-800 font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all flex items-center space-x-2">
                                        <ArrowLeft size={18}/><span>Back</span>
                                    </button>
                                    <button type="button" onClick={() => setStep(3)} disabled={isSpouseCategoryInvalid} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:bg-slate-400">
                                        <span>Next: Upload Documents</span><ArrowRight size={18}/>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* --- Step 3: Document Upload (REDESIGNED) --- */}
                        {step === 3 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
                                    <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-semibold text-blue-800">Applicant's Caste Certificate is Already Verified</h3>
                                        <p className="text-sm text-blue-700">Your verified certificate (Category: <strong>{loggedInUser.casteDetails.category}</strong>) is on file and will be automatically attached to this application.</p>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-4 border-t border-slate-200">
                                    <h3 className="font-semibold text-lg text-slate-800">Please Upload the Following Documents:</h3>
                                    <SingleFileUpload label="Marriage Certificate" required={true} file={marriageCertFile} onFileChange={setMarriageCertFile} />
                                    <SingleFileUpload label="Spouse's Aadhaar Card" required={true} file={spouseAadhaarFile} onFileChange={setSpouseAadhaarFile} />
                                    <SingleFileUpload label="Spouse's Caste Certificate" required={true} file={spouseCasteFile} onFileChange={setSpouseCasteFile} />
                                </div>
                                
                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={() => setStep(2)} className="bg-slate-200 text-slate-800 font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all flex items-center space-x-2">
                                        <ArrowLeft size={18}/><span>Back</span>
                                    </button>
                                    <button type="button" onClick={() => setStep(4)} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
                                        <span>Next: Review</span><ArrowRight size={18}/>
                                    </button>
                                </div>
                            </section>
                        )}
                        
                        {/* --- Step 4: Review & Submit --- */}
                        {step === 4 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                                    <h3 className="font-semibold text-lg text-blue-700">Spouse & Marriage Details</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <DetailItem label="Marriage Registration ID" value={formData.marriageRegistrationId} />
                                        <DetailItem label="Spouse's Name" value={formData.spouseName} />
                                        <DetailItem label="Spouse's Aadhaar" value={formData.spouseAadhaarNumber} />
                                        <DetailItem label="Spouse's Category" value={formData.spouseCategory} />
                                    </div>
                                    <h3 className="font-semibold text-lg text-blue-700 mt-4">Documents to be Submitted</h3>
                                    <ul className="list-disc list-inside text-slate-700">
                                        <li>Applicant Caste Certificate (Verified on File)</li>
                                        {marriageCertFile && <li>{marriageCertFile.name} (Marriage Certificate)</li>}
                                        {spouseAadhaarFile && <li>{spouseAadhaarFile.name} (Spouse's Aadhaar)</li>}
                                        {spouseCasteFile && <li>{spouseCasteFile.name} (Spouse's Caste Certificate)</li>}
                                    </ul>
                                </div>
                                 <div className="flex items-start">
                                     <input id="declaration" type="checkbox" required className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-1" />
                                     <label htmlFor="declaration" className="ml-3 block text-sm text-slate-900">
                                         I hereby declare that I am an Indian citizen and the information provided is true and correct to the best of my knowledge. I understand that if the information is found to be false, I am liable for legal action.
                                     </label>
                                 </div>
                                 <div className="flex justify-between mt-8">
                                     <button type="button" onClick={() => setStep(3)} className="bg-slate-200 text-slate-800 font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all flex items-center space-x-2">
                                         <ArrowLeft size={18}/><span>Back</span>
                                     </button>
                                     <button type="submit" disabled={isLoading} className="bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition-all flex items-center space-x-2 disabled:bg-slate-400">
                                         {isLoading ? <LoaderCircle className="animate-spin" /> : <span>Submit Application</span>}
                                     </button>
                                 </div>
                            </section>
                        )}

                    </form>
                </div>
            </main>
        </div>
    );
};

export default MarriageApplicationPage;