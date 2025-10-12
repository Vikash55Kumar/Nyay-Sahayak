import React, { useState } from 'react';
import './App.css';
import indiaBackground from '../assets/in.svg';
import atrocityVictimSupport from '../assets/victim.png';
import unityAndFuture from '../assets/marriage.png';
import { Link } from 'react-router-dom';


import Navbar from '../Layout/Navbar';
import Footer from '../Layout/Footer';

// --- Helper Data & Configuration ---
// In a real application, this would come from an API.
// Set to null to see the empty state for the tracker.
const mockApplication = {
  type: 'Relief for Atrocity Victim',
  caseId: 'POA-2025-10-MH-00123',
  status: 'Case Approved', 
  history: [
      { name: 'Application Submitted', date: '01 Oct 2025' },
      { name: 'Documents Verified', date: '04 Oct 2025' },
      { name: 'Case Approved', date: '09 Oct 2025' },
  ]
};

const allStatuses = [
  { name: 'Application Submitted', description: 'We have received your application.', estimate: 'Next: Document verification in approx. 3 working days.' },
  { name: 'Documents Verified', description: 'Your documents have been verified.', estimate: 'Next: Case approval in approx. 7-10 working days.' },
  { name: 'Case Approved', description: 'Your case has been approved by the district officer.', estimate: 'Next: Payment initiation in approx. 5-7 working days.' },
  { name: 'Payment Initiated', description: 'Payment is being processed.', estimate: 'Next: Amount disbursal in approx. 2-3 working days.' },
  { name: 'Amount Disbursed', description: 'The amount has been credited to your account.', estimate: 'Process complete.' },
];


// --- SVG Icons (Self-contained components for clarity) ---
const IconFileCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="m9 15 2 2 4-4" /></svg>
);
const IconBadgeCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.78l1.21 1.22a1 1 0 0 0 1.42 0l1.21-1.22a4 4 0 0 1 4.78 4.78l-1.22 1.21a1 1 0 0 0 0 1.42l1.22 1.21a4 4 0 0 1-4.78 4.78l-1.21-1.22a1 1 0 0 0-1.42 0l-1.21 1.22a4 4 0 0 1-4.78-4.78l1.22-1.21a1 1 0 0 0 0-1.42z" /><path d="m9 12 2 2 4-4" /></svg>
);
const IconUserCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><polyline points="16 11 18 13 22 9" /></svg>
);
const IconSend = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
);
const IconLandmark = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" x2="21" y1="22" y2="22" /><line x1="6" x2="6" y1="18" y2="11" /><line x1="10" x2="10" y1="18" y2="11" /><line x1="14" x2="14" y1="18" y2="11" /><line x1="18" x2="18" y1="18" y2="11" /><polygon points="12 2 20 7 4 7" /></svg>
);

const IconGavel = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14 13-8.5 8.5"/><path d="m18 9 -6 6"/><path d="m9.5 2.5 8 8"/><path d="m20.5 11.5-8-8"/><path d="m16 12-1.5 1.5a3 3 0 0 0-3 3L16 22l5.5-5.5a3 3 0 0 0 0-4.2z"/></svg>
);

const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);


// --- Background India Map SVG ---
const IndiaMapBackground = () => (
  <div className="hero-background" aria-hidden="true">
    <img
      src={indiaBackground}
      alt=""
      loading="lazy"
      className="hero-background__image"
    />
  </div>
);


// --- Main Components ---


const AvailableSchemes = () => (
    <div className="mt-8">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ color: '#343A40' }}>Available Schemes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="bg-white shadow-xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300 rounded-tl-2xl rounded-br-2xl overflow-hidden">
                <div 
                    className="relative w-full h-48 bg-cover bg-center rounded-tl-2xl"
                    style={{ backgroundImage: `url(${atrocityVictimSupport})` }}
                >
                    <div className="absolute inset-0 bg-blue-900 opacity-40"></div>
                    <div className="relative h-full flex items-center justify-center">
                        <h3 className="text-white text-3xl font-bold">Support and Dignity</h3>
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center mb-2">
                        <div className="p-2 rounded-full mr-3" style={{backgroundColor: 'rgba(0, 83, 156, 0.1)', color: '#00539C' }}><IconGavel /></div>
                        <h3 className="text-xl font-bold" style={{ color: '#00539C' }}>Relief for Atrocity Victim</h3>
                    </div>
                    <p className="text-gray-600 mb-4 flex-grow ml-11">Apply for monetary relief and support under the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act.</p>
                      <Link to={'/atrocity-relief'}><button className="sheen w-full mt-auto text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 cursor-pointer" style={{ backgroundColor: '#00539C' }}>
                        Start Application
                          </button>
                      </Link>                    

                </div>
            </div>
            
            <div className="bg-white shadow-xl flex flex-col transform hover:-translate-y-2 transition-transform duration-300 rounded-tr-2xl rounded-bl-2xl overflow-hidden">
                <div 
                    className="relative w-full h-48 bg-cover bg-center rounded-tr-2xl"
                    style={{ backgroundImage: `url(${unityAndFuture})` }}
                >
                    <div className="absolute inset-0 bg-(#FFD662) opacity-50"></div>
                    <div className="relative h-full flex items-center justify-center">
                        <h3 className="text-white text-3xl font-bold">Unity and Future</h3>
                    </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center mb-2">
                        <div className="p-2 rounded-full mr-3" style={{backgroundColor: 'rgba(0, 83, 156, 0.1)', color: '#00539C' }}><IconUsers /></div>
                        <h3 className="text-xl font-bold" style={{ color: '#00539C' }}>Inter-caste Marriage Incentive</h3>
                    </div>
                    <p className="text-gray-600 mb-4 flex-grow ml-11">Apply for the incentive scheme designed to promote social integration and harmony through inter-caste marriages.</p>
                    <Link to="/inter-caste-marriage">
                        <button className="sheen w-full mt-auto text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 cursor-pointer" style={{ backgroundColor: '#f2bb1f' }}>
                            Start Application
                        </button>
                    </Link>
                </div>
            </div>

        </div>
    </div>
);

interface Application {
  type: string;
  caseId: string;
  status: string;
  history: Array<{ name: string; date: string; }>;
}

const StatusTracker = ({ application }: { application: Application | null }) => {
  if (!application) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#343A40' }}>Current Application Status</h2>
        <div className="bg-white text-center p-8 rounded-xl shadow-lg border border-gray-200">
          <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No Active Applications</h3>
          <p className="mt-1 text-sm text-gray-500">You can start a new application by selecting one of the options above.</p>
        </div>
      </div>
    );
  }

  const historyMap = application.history.reduce<{ [key: string]: string }>((acc, item) => {
      acc[item.name] = item.date;
      return acc;
  }, {});

  const currentStatusIndex = allStatuses.findIndex(s => s.name === application.status);

  const getIcon = (index: number) => {
    const icons = [<IconFileCheck />, <IconBadgeCheck />, <IconUserCheck />, <IconSend />, <IconLandmark />];
    return icons[index];
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#343A40' }}>Current Application Status</h2>
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
        <div className="mb-4">
            <h3 className="text-xl font-bold" style={{ color: '#00539C' }}>{application.type}</h3>
            <p className="text-sm text-gray-500">Case ID: {application.caseId}</p>
        </div>
        <div className="flex flex-col">
          {allStatuses.map((status, index) => {
            const isCompleted = index < currentStatusIndex;
            const isCurrent = index === currentStatusIndex;
            const isNext = index === currentStatusIndex + 1;

            let statusColor = 'text-gray-400', iconBgColor = 'bg-gray-200', textColor = 'text-gray-500';
            if (isCompleted || isCurrent) { 
                statusColor = 'text-green-600'; 
                iconBgColor = 'bg-green-100';
                textColor = 'text-gray-800';
            }
            if (isCurrent) { 
                statusColor = 'text-blue-600'; 
                iconBgColor = 'bg-blue-100';
            }
            
            const date = historyMap[status.name];

            return (
              <div key={status.name} className={`flex items-start p-4 rounded-lg transition-all duration-300 ${isNext ? 'bg-yellow-50 shadow-md ring-1 ring-yellow-200' : ''}`}>
                <div className="flex flex-col items-center mr-4 sm:mr-6">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor} ${statusColor} transition-colors duration-500`}>{getIcon(index)}</div>
                  {index < allStatuses.length - 1 && <div className={`w-0.5 h-24 mt-2 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`}></div>}
                </div>
                <div className={`pt-2.5 pb-4 ${!isCompleted && !isCurrent && !isNext ? 'opacity-40' : ''}`}>
                  <h4 className={`font-bold ${isCurrent ? 'text-blue-800' : textColor}`}>{status.name}</h4>
                  <p className="text-sm text-gray-600">{status.description}</p>
                  {date && <p className="text-xs text-green-700 font-semibold mt-1">Completed on: {date}</p>}
                  {isCurrent && <p className="text-xs text-blue-700 font-semibold mt-1 animate-pulse">{status.estimate}</p>}
                   {isNext && <p className="text-xs text-yellow-800 font-semibold mt-1 animate-pulse">This is your next step.</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [application, setApplication] = useState(mockApplication);
  
  return (
    <>
      <Navbar />
      <div style={{ backgroundColor: '#F8F9FA', fontFamily: "'Inter', sans-serif" }} className="min-h-screen overflow-x-hidden">
        
        <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          <div className="relative text-center py-8">
              <IndiaMapBackground />
              <h1 className="relative text-4xl font-bold tracking-tight" style={{ color: '#343A40' }}>
              Beneficiary Dashboard
              </h1>
              <p className="relative text-lg text-gray-600 mt-2">Apply for a scheme or track your existing application.</p>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
              <AvailableSchemes />
              <StatusTracker application={application} />
          </div>
        </main>
      </div>
      <Footer />
  </>
  );
}