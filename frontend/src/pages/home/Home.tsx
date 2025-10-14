import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShieldAlert, Heart, Zap, Eye, Users, Lock } from 'lucide-react';

const PromiseCard = ({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) => (
    <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-lg bg-blue-600 text-white">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-slate-600">{description}</p>
        </div>
    </div>
);

const LandingPage: React.FC = () => {

    return (
        <div className="bg-white text-slate-800">
            
            {/* --- Hero Section --- */}
            <section className="relative bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 gap-12 items-center py-20">
                        <div className="text-center md:text-left animate-fade-in-right">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
                                Immediate Support, Lasting Justice.
                            </h1>
                            <p className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg sm:text-xl text-slate-600">
                                A dedicated portal for financial assistance under the Prevention of Atrocities (PoA) and Protection of Civil Rights (PCR) Acts. We are here to ensure your rights are protected and upheld.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                                <Link to="/apply/atrocity" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-red-600 border border-transparent rounded-md font-semibold text-white hover:bg-red-700 transition-all text-base shadow-lg">
                                    Get Atrocity Relief
                                </Link>
                                <Link to="/apply/marriage" className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-blue-600 border border-transparent rounded-md font-semibold text-white hover:bg-blue-700 transition-all text-base shadow-lg">
                                    Claim Marriage Incentive
                                </Link>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <img src="https://images.unsplash.com/photo-1598202012110-1e2b3ef7740e?q=80&w=1932&auto=format&fit=crop" alt="Hands offering support" className="rounded-lg shadow-2xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- We Stand With You Section --- */}
            <section id="support-for" className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">We Stand With You</h2>
                        <p className="mt-4 text-lg text-slate-600">This portal is designed for two specific purposes to uphold your rights and dignity.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 bg-slate-50 rounded-lg border border-slate-200">
                            <ShieldAlert className="h-10 w-10 text-red-600" />
                            <h3 className="mt-4 text-xl font-bold">For Victims of Atrocity & Discrimination</h3>
                            <p className="mt-2 text-slate-600">If you have been a victim of a crime or discrimination under the PoA or PCR Acts, this portal provides a direct and confidential way to apply for the monetary relief you are entitled to.</p>
                            <Link to="/apply/atrocity" className="mt-4 inline-flex items-center font-semibold text-blue-600 hover:text-blue-800">
                                Start Your Relief Application <ArrowRight className="ml-2" size={16}/>
                            </Link>
                        </div>
                        <div className="p-8 bg-slate-50 rounded-lg border border-slate-200">
                            <Heart className="h-10 w-10 text-pink-600" />
                            <h3 className="mt-4 text-xl font-bold">For Champions of Social Change</h3>
                            <p className="mt-2 text-slate-600">Couples in inter-caste marriages, where one spouse belongs to the SC/ST category, can apply for financial incentives that celebrate and support their step towards social integration.</p>
                            <Link to="/apply/marriage" className="mt-4 inline-flex items-center font-semibold text-blue-600 hover:text-blue-800">
                                Apply for Marriage Incentive <ArrowRight className="ml-2" size={16}/>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- How We Ensure Justice is Delivered Section --- */}
            <section id="our-promise" className="py-20 bg-slate-50">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How We Ensure Justice is Delivered</h2>
                        <p className="mt-4 text-lg text-slate-600">Our commitment to a better system is built on these four pillars.</p>
                    </div>
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
                        <PromiseCard 
                            icon={Zap} 
                            title="Direct & Fast Support" 
                            description="Funds are transferred directly to your bank account using DBT. Our streamlined process is designed to minimize delays."
                        />
                        <PromiseCard 
                            icon={Eye} 
                            title="Complete Transparency" 
                            description="Track the status of your application at every stage, from submission to payment. No more uncertainty."
                        />
                        <PromiseCard 
                            icon={Users} 
                            title="Accessible to All" 
                            description="Apply from your phone or get assistance from your nearest Common Service Center (CSC) with Biometric (AePS) verification."
                        />
                         <PromiseCard 
                            icon={Lock} 
                            title="Confidential & Secure" 
                            description="Your personal information and case details are protected with the highest standards of data security and privacy."
                        />
                    </div>
                 </div>
            </section>
            
            {/* --- Impact in Rajasthan Section --- */}
            <section id="impact" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center">
                        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Our Impact in Rajasthan</h2>
                        <p className="mt-4 text-lg text-slate-600">Real-time data on how this portal is making a difference.</p>
                    </div>
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="p-8 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-5xl font-extrabold text-blue-600">1,248</p>
                            <p className="mt-2 text-lg font-medium text-slate-700">Beneficiaries Supported</p>
                        </div>
                         <div className="p-8 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-5xl font-extrabold text-emerald-600">₹8.7 Cr</p>
                            <p className="mt-2 text-lg font-medium text-slate-700">Funds Disbursed</p>
                        </div>
                         <div className="p-8 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-5xl font-extrabold text-amber-600">12 Days</p>
                            <p className="mt-2 text-lg font-medium text-slate-700">Average Processing Time</p>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default LandingPage;