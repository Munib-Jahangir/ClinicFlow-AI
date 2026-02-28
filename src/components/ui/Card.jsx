const Card = ({ children, className = '', title, subtitle, action, hover = false }) => {
  return (
    <div className={`bg-white rounded-2xl shadow-card ${hover ? 'hover:shadow-card-hover transition-shadow duration-300' : ''} ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
