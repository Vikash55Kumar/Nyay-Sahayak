import React from 'react';

// --- A single read-only field ---
const DetailField = ({ label, value }: { label: string; value: string }) => (
    <div>
        <label className="block text-xs font-medium text-gray-500">{label}</label>
        <div className="mt-1 p-3 bg-gray-100 border border-gray-200 rounded-md shadow-sm text-gray-700 text-sm">
            {value}
        </div>
    </div>
);

// --- User Details Display Component ---
export default function UserDetailsDisplay({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
    // Dummy data for now, to be replaced with actual fetched data
    const userDetails = {
        name: 'Priya Sharma',
        dob: '01/01/1990',
        gender: 'Female',
        address: '123, ABC Street, New Delhi, Delhi - 110001',
        mobile: 'XXXXXX1234',
        aadhaar: 'XXXX XXXX 1234',
    };

    return (
        <div className="space-y-6 fade-in">
            
            <div className="space-y-4">
                <DetailField label="Name" value={userDetails.name} />
                <div className="grid grid-cols-2 gap-4">
                    <DetailField label="Date of Birth" value={userDetails.dob} />
                    <DetailField label="Gender" value={userDetails.gender} />
                </div>
                <DetailField label="Address" value={userDetails.address} />
                <div className="grid grid-cols-2 gap-4">
                    <DetailField label="Registered Mobile" value={userDetails.mobile} />
                    <DetailField label="Aadhaar Number" value={userDetails.aadhaar} />
                </div>
            </div>
            <div className="flex flex-col sm:flex-row-reverse gap-3 pt-4">
                 <button
                    onClick={onConfirm}
                    className="sheen w-full sm:w-auto flex justify-center py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors relative overflow-hidden"
                    style={{ backgroundColor: '#28a745' }} // Green for confirm
                >
                    Confirm
                </button>
                <button
                    onClick={onCancel}
                    className="sheen w-full sm:w-auto flex justify-center py-3 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors relative overflow-hidden"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
