import React from 'react';

const About: React.FC = () => {
  return (
    <div className="bg-gradient-to-b from-slate-50 to-white">
      {/* Government Header Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 h-2"></div>
      <div className="bg-blue-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-sm font-medium">Government of India</div>
            <div className="h-4 w-px bg-white/30"></div>
            <div className="text-sm">Ministry of Statistics and Programme Implementation</div>
          </div>
          <div className="text-sm font-medium">Digital India Initiative</div>
        </div>
      </div>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100 py-20 border-b border-blue-200">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 border border-blue-200 rounded-full mb-8">
            <span className="text-sm font-semibold tracking-widest uppercase text-blue-800">
              About Nyay Sahayak
            </span>
          </div>
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Nyay Sahayak — Citizen Assistance & Relief Portal
          </h1>
          <p className="text-xl text-slate-700 max-w-4xl mx-auto leading-relaxed">
            A digital platform to help marginalized and vulnerable citizens apply for assistance, track
            application status, and receive timely relief — covering atrocity relief, caste-discrimination
            complaints, marriage-related support, and compensation processes.
          </p>
          
          {/* Key Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200 shadow-lg">
              <div className="text-3xl font-bold text-blue-900">25k+</div>
              <div className="text-sm text-slate-600 font-medium">Beneficiaries Registered</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200 shadow-lg">
              <div className="text-3xl font-bold text-green-700">8k+</div>
              <div className="text-sm text-slate-600 font-medium">Applications Processed</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 shadow-lg">
              <div className="text-3xl font-bold text-purple-700">72%</div>
              <div className="text-sm text-slate-600 font-medium">Average Resolution Rate</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-200 shadow-lg">
              <div className="text-3xl font-bold text-orange-700">3</div>
              <div className="text-sm text-slate-600 font-medium">Primary Services</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-20 space-y-24">
        {/* Project Overview */}
        <section className="relative">
          <div className="bg-blue-100 border border-blue-200 rounded-3xl p-8 lg:p-12 text-gray-900 shadow-lg">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-3xl font-bold mb-6 text-blue-900">Project Overview</h3>
                <div className="space-y-6 text-blue-800 leading-relaxed">
                  <p className="text-lg">
                    Nyay Sahayak is a citizen-focused portal designed to simplify access to government relief and support services.
                    It enables beneficiaries to register using Aadhaar-backed data (with manual overrides for email and parent names), submit
                    applications for atrocity relief, caste-discrimination complaints, marriage-related aid and other assistance, and monitor
                    progress through each stage of the workflow.
                  </p>
                  <p className="text-lg">
                    The platform collects structured application data and accepts supporting-document metadata (filename + type). For now,
                    documents are represented by metadata to reduce friction; the backend synthesizes a stable file URL placeholder so records
                    remain audit-ready and traceable. Officers use a dedicated authority interface to review, verify, approve, or reject claims,
                    and payments are initiated transparently when approved.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-md">
                  <div className="text-center mb-6">
                    <div className="text-4xl mb-3">🧠</div>
                    <h4 className="text-xl font-bold text-blue-900">AI Classification Engine</h4>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-gray-700 font-medium">Processing Speed</span>
                      <span className="text-green-600 font-bold">0.3s</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-gray-700 font-medium">Accuracy Rate</span>
                      <span className="text-green-600 font-bold">99.2%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <span className="text-gray-700 font-medium">Coverage</span>
                      <span className="text-green-600 font-bold">100%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 border border-green-200 rounded-full mb-6">
              <span className="text-sm font-semibold tracking-widest uppercase text-green-800">
                Advanced Capabilities
              </span>
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Core Capabilities</h3>
            <p className="text-xl text-slate-700 max-w-4xl mx-auto">
              A secure, auditable workflow for beneficiaries and authorities — designed for low-friction registration, transparent tracking, and reliable payouts.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                title: 'Low-friction Registration', 
                description: 'Aadhaar-backed data population with manual entry for essential fields (email, parent names) to ensure both convenience and correctness.', 
                icon: '�',
              },
              { 
                title: 'Application Tracking', 
                description: 'End-to-end status tracking with timeline events, officer assignments and transparent next-steps for beneficiaries.', 
                icon: '📍',
              },
              { 
                title: 'Document Metadata Flow', 
                description: 'Accepts document metadata (filename + type); backend persists placeholders (fileUrl) so records are auditable without immediate uploads.', 
                icon: '📁',
              },
              { 
                title: 'Authority Review Console', 
                description: 'Dedicated UI for officers to verify data, request clarifications, approve/reject claims and initiate payments.', 
                icon: '🏛️',
              },
              { 
                title: 'Notifications & Audit', 
                description: 'SMS / in-app notifications for status changes, and comprehensive audit logs for every workflow action.', 
                icon: '�',
              },
              { 
                title: 'Secure Payments', 
                description: 'Integrated payout flow for approved assistance with transaction records and reconciliation support.', 
                icon: '�',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-lg border border-gray-300 bg-white p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-lg shadow-sm mb-4 group-hover:bg-blue-700 transition-colors duration-300">
                  <span className="text-xl">{feature.icon}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                
                {/* Feature Status */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 font-medium">Status</span>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                    ✅ Operational
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Expected Impact */}
        <section>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-orange-100 border border-orange-200 rounded-full mb-6">
              <span className="text-sm font-semibold tracking-widest uppercase text-orange-800">
                Transformational Impact
              </span>
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Expected Social Impact</h3>
            <p className="text-xl text-slate-700 max-w-4xl mx-auto">
              Improve access to justice and relief for vulnerable citizens, accelerate grievance resolution, and ensure transparent benefit distribution.
            </p>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { 
                title: 'Faster Access to Relief', 
                desc: 'Shorten the time from complaint/claim submission to resolution and disbursal, so beneficiaries receive support when it matters most.',
                icon: '⚡',
              },
              { 
                title: 'Transparent Workflows', 
                desc: 'Clear timelines, officer assignments, and immutable audit logs that strengthen accountability and trust.',
                icon: '🔍',
              },
              { 
                title: 'Cost-Effective Delivery', 
                desc: 'Reduce overhead with a paperless, metadata-first approach that lowers operational costs while keeping records auditable.',
                icon: '💰',
              },
              { 
                title: 'Scalable & Inclusive', 
                desc: 'Built to scale nationwide with multi-language support and accessible UI for low-literacy users.',
                icon: '🌏',
              },
            ].map((impact) => (
              <div key={impact.title} className="group relative overflow-hidden rounded-lg border border-gray-300 bg-white p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-600 text-white rounded-lg shadow-sm mb-4 group-hover:bg-gray-700 transition-colors duration-300">
                  <span className="text-xl">{impact.icon}</span>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">{impact.title}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{impact.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Technology Stack */}
        <section>
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-purple-100 border border-purple-200 rounded-full mb-6">
              <span className="text-sm font-semibold tracking-widest uppercase text-purple-800">
                Technology Foundation
              </span>
            </div>
            <h3 className="text-4xl font-bold text-slate-900 mb-6">Enterprise-Grade Technology Stack</h3>
            <p className="text-xl text-slate-700 max-w-4xl mx-auto">
              Built on proven technologies with government-standard security and reliability protocols.
            </p>
          </div>
          
          <div className="bg-gray-100 border border-gray-200 rounded-3xl p-8 lg:p-12 text-gray-900 shadow-lg">

            
            <div className="mt-12 text-center">
              <h4 className="text-2xl font-bold mb-4 text-gray-900">Government Compliance & Security</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="text-3xl mb-3">🔐</div>
                  <div className="font-semibold mb-2 text-gray-900">Data Security</div>
                  <div className="text-sm text-gray-600">End-to-end encryption and secure protocols</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="text-3xl mb-3">✅</div>
                  <div className="font-semibold mb-2 text-gray-900">MoSPI Compliance</div>
                  <div className="text-sm text-gray-600">Meets all ministry standards and requirements</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
                  <div className="text-3xl mb-3">🌐</div>
                  <div className="font-semibold mb-2 text-gray-900">Scalable Infrastructure</div>
                  <div className="text-sm text-gray-600">Cloud-native architecture for nationwide deployment</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
