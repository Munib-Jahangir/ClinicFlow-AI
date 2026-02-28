const Select = ({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <select
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none bg-white ${
          error ? 'border-danger focus:ring-danger' : ''
        } ${className}`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export default Select;
