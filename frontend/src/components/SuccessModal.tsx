import { Link } from 'react-router-dom';

const CheckCircleIcon = () => (
    <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

export default function SuccessModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 backdrop-blur-lg flex justify-center items-center z-50"
            onClick={onClose}
        >
            <div 
                className="relative bg-white shadow-2xl p-8 max-w-md w-full m-4 text-center transform transition-all duration-300 ease-in-out scale-95 hover:scale-100"
                style={{ borderRadius: '1rem 0 1rem 0' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 -mt-4 -ml-4 w-16 h-16 bg-green-200 rounded-full opacity-50"></div>
                <div className="absolute bottom-0 right-0 -mb-4 -mr-4 w-24 h-24 bg-blue-200 rounded-full opacity-50"></div>

                <div className="relative z-10">
                    <CheckCircleIcon />
                    <h2 className="text-2xl font-bold text-gray-800 mt-4">Application Submitted!</h2>
                    <p className="text-gray-600 mt-2">
                        Your application is now under review. We will notify you of the status.
                    </p>
                    <div className="mt-6 flex justify-center space-x-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            Close
                        </button>
                        <Link 
                            to="/dashboard"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

