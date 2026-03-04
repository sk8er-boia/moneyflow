import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, action }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col ${className}`}>
      {(title || action) && (
        <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
          {title && <h3 className="font-bold text-gray-800 text-sm">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
};