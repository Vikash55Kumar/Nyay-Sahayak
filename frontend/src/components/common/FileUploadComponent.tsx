import React, { useState, useCallback, useRef } from 'react';

// --- SVG Icons ---
const DocumentPlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
    </svg>
);

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    label?: string;
}

const FileUploadComponent = ({ onFileSelect, label }: FileUploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null); // Reference to the hidden file input

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            onFileSelect(selectedFile);
        }
    };
    
    const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            onFileSelect(e.dataTransfer.files[0]);
        }
    }, [onFileSelect]);

    const handleChooseFileClick = () => {
        fileInputRef.current?.click(); // Trigger the hidden file input using optional chaining
    };

    const handleRemoveFile = () => {
        setFile(null);
        onFileSelect(null as any); // Notify parent that file is removed
    };

    // This component now displays the upload area or the selected file.
    return (
        <div className="space-y-2">
            {label && <label className="block text-sm font-semibold text-gray-700">{label}</label>}
            
            {file ? (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <span className="text-sm font-medium text-gray-700 truncate">{file.name}</span>
                    <button 
                        type="button"
                        onClick={handleRemoveFile} 
                        className="ml-4 text-sm font-medium text-red-600 hover:text-red-800"
                    >
                        Remove
                    </button>
                </div>
            ) : (
                <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`flex flex-col items-center justify-center p-8 border-2 rounded-lg transition-colors duration-200 
                                ${isDragging ? 'border-blue-500 bg-blue-50/50' : 'border-dashed border-gray-300 bg-white'}`}
                    style={{ borderColor: isDragging ? '#3B82F6' : '#D1D5DB', borderWidth: '1px', borderStyle: 'dashed' }}
                >
                    <DocumentPlusIcon />
                    <p className="text-base text-gray-600 mt-4">
                        Choose file or drag and drop to upload
                    </p>
                    <button
                        type="button"
                        onClick={handleChooseFileClick}
                        className="mt-6 px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Choose File
                    </button>
                    {/* Hidden input to handle file selection */}
                    <input 
                        id={`file-upload-${label}`} 
                        name={`file-upload-${label}`} 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange} 
                        ref={fileInputRef}
                    />
                </div>
            )}
        </div>
    );
};

export default FileUploadComponent;