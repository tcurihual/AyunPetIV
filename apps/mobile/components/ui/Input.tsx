  Controller,
import { Controller } from "react-hook-form";

interface InputProps {
  name: string;
  control: any; // pal useForm()
  label?: string;
  placeholder?: string;
  type?: string;
  rules?: object; //esto es pa la validacion
}

const Input: React.FC<InputProps> = ({ name, control, label, placeholder, type = "text", rules }) => {
  return (
    <div className="flex flex-col w-full mb-4">
      {label && <label className="mb-1 text-sm font-semibold text-gray-700">{label}</label>}
      
      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field, fieldState }) => (
          <>
            <input
              {...field}
              type={type}
              placeholder={placeholder}
              className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 
              ${fieldState.error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
            />
            {fieldState.error && (
              <p className="text-red-500 text-xs mt-1">{fieldState.error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default Input;