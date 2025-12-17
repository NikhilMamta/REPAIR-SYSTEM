import React from 'react';

export const Table = ({ children }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        {children}
      </table>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        {children}
      </tr>
    </thead>
  );
};

export const TableBody = ({ children }) => {
  return (
    <tbody className="divide-y divide-gray-200">
      {children}
    </tbody>
  );
};

export const TableRow = ({ children }) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      {children}
    </tr>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
      {children}
    </th>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`px-4 py-3 text-sm text-gray-900 ${className}`}>
      {children}
    </td>
  );
};