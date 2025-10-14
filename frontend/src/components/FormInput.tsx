interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> { label: string; }
const FormInput: React.FC<FormInputProps> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">{label} {props.required && <span className="text-red-500">*</span>}</label>
        {props.type === 'textarea' ? (
             <textarea className="w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...props as React.TextareaHTMLAttributes<HTMLTextAreaElement>} />
        ) : (
             <input className="w-full px-4 py-2.5 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" {...props as React.InputHTMLAttributes<HTMLInputElement>} />
        )}
    </div>
);

interface DetailItemProps { label: string; value: string; }
const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
    <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-base text-slate-800">{value}</p>
    </div>
);

export { FormInput, DetailItem };