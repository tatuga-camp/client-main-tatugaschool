export const InputField = ({
  type,
  placeholder,
  value,
  onChange,
  required = true,
}: {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className="w-full p-3 sm:p-4 mb-4 border border-gray-300 rounded-lg"
  />
);
