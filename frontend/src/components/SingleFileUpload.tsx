import { CheckCircle, Trash2, UploadCloud } from "lucide-react";

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

export default SingleFileUpload;
