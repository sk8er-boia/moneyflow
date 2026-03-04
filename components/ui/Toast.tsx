
import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Props {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<Props> = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-gray-800' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const icon = type === 'success' ? <CheckCircle size={18} className="text-green-400" /> : <AlertCircle size={18} className="text-white" />;

  return (
    <div className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full shadow-lg text-white text-sm font-medium z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColor}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
};
