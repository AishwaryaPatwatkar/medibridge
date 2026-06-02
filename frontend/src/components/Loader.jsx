import React from 'react';

const Loader = ({ size = 'md', text = '' }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div
        className={`${sizeClasses[size]} border-medical-200 border-t-primary-500 rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-3 text-sm text-medical-600 font-medium animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export default Loader;
