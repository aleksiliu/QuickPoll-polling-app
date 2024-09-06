import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent">
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;