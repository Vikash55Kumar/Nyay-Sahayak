import React, { useState } from 'react';
import { ShieldAlert, FileWarning, FileUp, CheckCircle, LoaderCircle, AlertTriangle, ArrowRight, ArrowLeft, ShieldCheck, Gavel, User } from 'lucide-react';
import applicationService from '../../services/applicationService';
import type { AtrocityReliefInput } from '../../services/applicationService';
import { FormInput } from '../../components/FormInput';
import SingleFileUpload from '../../components/SingleFileUpload';
import { Link } from 'react-router-dom';

// --- MOCK DATA (Simulating a logged-in user's profile) ---
const loggedInUser = {
    fullName: "Geeta Devi",
    casteDetails: { category: "ST", caste: "Bhil Meena" }
};


const AtrocityApplicationPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<{ applicationId: string; message: string } | null>(null);
    // Document upload states
    const [firFile, setFirFile] = useState<File | null>(null);
    const [otherFiles, setOtherFiles] = useState<File[]>([]);

    // Step 1 State
    const [selectedAct, setSelectedAct] = useState<'POA' | 'PCR' | null>(null);

    // Step 2 State
    const [formData, setFormData] = useState({
        firNumber: '',
        policeStation: '',
        district: '',
        dateOfIncident: '',
        sectionsApplied: '', // Optional for user
    });

    // Step 3 State
    const [incidentDescription, setIncidentDescription] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Validate FIR file
        if (!firFile) {
            setError("A copy of the FIR is a mandatory document.");
            setIsLoading(false);
            setStep(3); // Go back to document step
            return;
        }

        // Validate other required fields if needed
        // You can add more validation here

        try {
            // Build supportingDocuments metadata (no real file upload)
            type SupportingDoc = { fileName: string };
            const supportingDocuments: SupportingDoc[] = [];
            if (firFile) supportingDocuments.push({ fileName: firFile.name });
            otherFiles.forEach(f => supportingDocuments.push({ fileName: f.name }));

            const payload = {
                firNumber: formData.firNumber,
                policeStation: formData.policeStation,
                district: formData.district,
                dateOfIncident: formData.dateOfIncident,
                incidentDescription,
                sectionsApplied: formData.sectionsApplied ? formData.sectionsApplied.split(',').map(s => s.trim()) : undefined,
                supportingDocuments,
                applicationReason: 'Atrocity/Discrimination relief application'
            };

            const res = await applicationService.submitAtrocityRelief(payload as unknown as AtrocityReliefInput);
            const appId = (res && (res.applicationId || res.id || res._id)) ?? null;
            await applicationService.getMyApplications();
            const message = (res && (res.message || 'Application submitted successfully. It is now under review by the authorities.')) || 'Application submitted successfully.';
            setSuccessData({ applicationId: appId ?? `ATR_${new Date().getFullYear()}_${Math.floor(Math.random() * 900000) + 100000}`, message });
        } catch (err) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to submit application';
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (successData) {
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
        );
    }

    return (
        <div className="bg-slate-50 min-h-screen">
             <main className="max-w-4xl mx-auto py-12 px-4">
                <div className="bg-white rounded-lg shadow-lg border border-slate-200">
                    <div className="p-6 border-b border-slate-200">
                        <h2 className="text-2xl font-bold text-slate-800">Application for Atrocity & Discrimination Relief</h2>
                        <p className="text-slate-500 mt-1">Please provide details about the incident. Your information will be kept confidential.</p>
                    </div>
                    
                    {/* Stepper */}
                    <div className="p-6 flex justify-around border-b border-slate-200">
                        {[
                            { num: 1, title: "Incident Type", icon: Gavel },
                            { num: 2, title: "FIR Details", icon: FileWarning },
                            { num: 3, title: "Description & Documents", icon: FileUp },
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
                    {/* --- Section 1: Applicant and Process Info --- */}
                    <section className="space-y-6">
                        <div className="py-4 px-8 bg-blue-50 border border-blue-200 flex items-start space-x-3">
                            <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-blue-800">Applicant Details</h3>
                                <p className="text-sm text-blue-700">Name: <strong>{loggedInUser.fullName}</strong> | Category: <strong>{loggedInUser.casteDetails.category}</strong></p>
                            </div>
                        </div>
                    </section>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded-md flex items-center text-sm">
                                <AlertTriangle className="mr-3 h-5 w-5" />
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {/* --- NEW Step 1: Incident Type Selection --- */}
                        {step === 1 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <h3 className="font-semibold text-lg text-slate-800">What was the nature of the incident?</h3>
                                <p className="text-sm text-slate-500">Please select the category that best describes what happened. This helps us direct your application correctly.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                                    <div
                                        onClick={() => setSelectedAct('POA')}
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                            selectedAct === 'POA' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        <ShieldAlert className="h-10 w-10 text-red-600" />
                                        <h4 className="mt-3 font-bold text-slate-800">Atrocity or Violent Crime</h4>
                                        <p className="text-sm text-slate-600 mt-1">Includes physical harm, threats, sexual assault, property damage, or other major offenses listed under the PoA Act.</p>
                                    </div>
                                    <div
                                        onClick={() => setSelectedAct('PCR')}
                                        className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                                            selectedAct === 'PCR' ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-400'
                                        }`}
                                    >
                                        <User className="h-10 w-10 text-amber-600" />
                                        <h4 className="mt-3 font-bold text-slate-800">Discrimination or Denial of Rights</h4>
                                        <p className="text-sm text-slate-600 mt-1">Includes being denied access to public places (wells, shops, temples), social boycott, or insults related to untouchability under the PCR Act.</p>
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8">
                                    <button type="button" onClick={() => setStep(2)} disabled={!selectedAct} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 disabled:bg-slate-400">
                                        <span>Next: FIR Details</span><ArrowRight size={18}/>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* --- Step 2: FIR Details --- */}
                        {step === 2 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <FormInput label="FIR Number *" name="firNumber" value={formData.firNumber} onChange={handleInputChange} required />
                                    <FormInput label="Date of Incident *" name="dateOfIncident" type="date" value={formData.dateOfIncident} onChange={handleInputChange} required />
                                    <FormInput label="Police Station *" name="policeStation" value={formData.policeStation} onChange={handleInputChange} required />
                                    <FormInput label="District *" name="district" value={formData.district} onChange={handleInputChange} required />
                                </div>
                                <FormInput label="Sections mentioned in FIR (if known)" name="sectionsApplied" placeholder="e.g., IPC 323, SC/ST Act 3(1)(r)" value={formData.sectionsApplied} onChange={handleInputChange} />
                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={() => setStep(1)} className="bg-slate-200 text-slate-800 font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all flex items-center space-x-2">
                                        <ArrowLeft size={18}/><span>Back</span>
                                    </button>
                                    <button type="button" onClick={() => setStep(3)} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
                                        <span>Next: Description & Documents</span><ArrowRight size={18}/>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* --- Step 3: Incident Description & Documents --- */}
                        {step === 3 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <div>
                                    <label htmlFor="incidentDescription" className="block text-sm font-medium text-slate-700 mb-1">Brief Description of Incident *</label>
                                    <textarea
                                        id="incidentDescription"
                                        name="incidentDescription"
                                        rows={4}
                                        value={incidentDescription}
                                        onChange={(e) => setIncidentDescription(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Please describe what happened in your own words."
                                        required
                                    />
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-200">
                                    <h3 className="font-semibold text-lg text-slate-800">Upload Supporting Documents:</h3>
                                    <SingleFileUpload label="Copy of FIR" required={true} file={firFile} onFileChange={setFirFile} />
                                    {/* For multiple files, you may need to use a multi-file upload component. For now, allow one optional file. */}
                                    <SingleFileUpload label="Other Supporting Document (Optional)" required={false} file={otherFiles[0] || null} onFileChange={file => setOtherFiles(file ? [file] : [])} />
                                </div>
                                <div className="flex justify-between mt-8">
                                    <button type="button" onClick={() => setStep(2)} className="bg-slate-200 text-slate-800 font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-300 transition-all flex items-center space-x-2">
                                        <ArrowLeft size={18}/><span>Back</span>
                                    </button>
                                    <button type="button" onClick={() => setStep(4)} className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2">
                                        <span>Next: Review Application</span><ArrowRight size={18}/>
                                    </button>
                                </div>
                            </section>
                        )}

                        {/* --- Step 4: Review & Submit --- */}
                        {step === 4 && (
                            <section className="space-y-6 animate-fade-in-up">
                                <div className="space-y-4 p-4 bg-slate-50 border border-slate-200 rounded-md">
                                    <h3 className="font-semibold text-lg text-blue-700">Application Review</h3>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <p className="text-sm text-slate-600">Incident Type</p>
                                            <p className="font-medium text-slate-800">
                                                {selectedAct === 'POA' ? 'Atrocity / Violent Crime (PoA)' : selectedAct === 'PCR' ? 'Discrimination / Denial of Rights (PCR)' : '—'}
                                            </p>

                                            <p className="text-sm text-slate-600 mt-3">Applicant</p>
                                            <p className="font-medium text-slate-800">{loggedInUser?.fullName || '—'}</p>
                                        </div>

                                        <div>
                                            <p className="text-sm text-slate-600">FIR Number</p>
                                            <p className="font-medium text-slate-800">{formData.firNumber || '—'}</p>

                                            <p className="text-sm text-slate-600 mt-3">Police Station / District</p>
                                            <p className="font-medium text-slate-800">{formData.policeStation || '—'}{formData.district ? ` — ${formData.district}` : ''}</p>
                                        </div>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-sm text-slate-600">Date of Incident</p>
                                        <p className="font-medium text-slate-800">{formData.dateOfIncident ? new Date(formData.dateOfIncident).toLocaleDateString() : '—'}</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-sm text-slate-600">Sections mentioned in FIR</p>
                                        <p className="font-medium text-slate-800">{formData.sectionsApplied || '—'}</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-sm text-slate-600">Brief Description</p>
                                        <p className="font-medium text-slate-800 whitespace-pre-wrap">{incidentDescription || '—'}</p>
                                    </div>

                                    <div className="mt-3">
                                        <p className="text-sm text-slate-600">Supporting Documents</p>
                                        <ul className="list-disc list-inside mt-1 text-slate-700">
                                            <li>FIR: {firFile ? firFile.name : 'Not provided'}</li>
                                            {otherFiles && otherFiles.length > 0 ? (
                                                otherFiles.map((f, i) => <li key={i}>{f.name}</li>)
                                            ) : (
                                                <li>Other supporting documents: Not provided</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <input id="declaration" type="checkbox" required className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 mt-1" />
                                    <label htmlFor="declaration" className="ml-3 block text-sm text-slate-900">
                                        I hereby declare that the information provided is true and correct. I understand that submitting false information is a punishable offense.
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

export default AtrocityApplicationPage;