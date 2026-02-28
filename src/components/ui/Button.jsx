import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg',
    secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-500',
    medical: 'bg-medical-600 text-white hover:bg-medical-700 focus:ring-medical-500 shadow-md hover:shadow-lg',
    success: 'bg-success text-white hover:bg-emerald-600 focus:ring-success',
    warning: 'bg-warning text-white hover:bg-amber-600 focus:ring-warning',
    danger: 'bg-danger text-white hover:bg-red-600 focus:ring-danger',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
