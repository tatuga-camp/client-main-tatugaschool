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
    className="mb-4 w-full rounded-2xl border border-gray-300 p-3 sm:p-4"
  />
);
