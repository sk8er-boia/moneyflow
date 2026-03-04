
import React from 'react';
import { X, ArrowUpCircle, ArrowDownCircle, CreditCard, Calendar } from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  transactions: Transaction[];
}

export const ChartDetailModal: React.FC<Props> = ({ isOpen, onClose, title, transactions }) => {
  if (!isOpen) return null;

  // Calculate totals for the selected view
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
            <p className="text-xs text-gray-500 mt-1">총 {transactions.length}건의 내역</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary for this selection */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-white border-b border-gray-100">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
                <p className="text-xs text-blue-600 font-medium mb-1">수입 합계</p>
                <p className="text-sm font-bold text-blue-700">{totalIncome.toLocaleString()}원</p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
                <p className="text-xs text-red-600 font-medium mb-1">지출 합계</p>
                <p className="text-sm font-bold text-red-700">{totalExpense.toLocaleString()}원</p>
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          {transactions.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              내역이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`${t.type === 'income' ? 'text-blue-500' : 'text-red-500'}`}>
                      {t.type === 'income' ? <ArrowUpCircle size={20} /> : <ArrowDownCircle size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 text-sm">{t.category}</p>
                        {t.bank && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded-md flex items-center gap-1">
                                <CreditCard size={10} />
                                {t.bank}
                            </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} />
                        {t.date} {t.description && `• ${t.description}`}
                      </p>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}원
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
