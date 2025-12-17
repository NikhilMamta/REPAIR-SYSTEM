import React from 'react';

const ChartCard = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default ChartCard;