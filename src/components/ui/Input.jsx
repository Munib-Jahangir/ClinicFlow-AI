const Input = ({
  label,
  error,
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
      <input
        className={`w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 outline-none placeholder:text-gray-400 ${
          error ? 'border-danger focus:ring-danger' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export default Input;
