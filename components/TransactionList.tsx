import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, ArrowDownCircle, ArrowUpCircle, CreditCard, Edit2, Filter, ChevronDown } from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  currentViewDate: Date;
}

export const TransactionList: React.FC<Props> = ({ transactions, onDelete, onEdit, currentViewDate }) => {
  // Use currentViewDate with fallback to today
  const initialYear = currentViewDate ? currentViewDate.getFullYear() : new Date().getFullYear();
  const initialMonth = currentViewDate ? currentViewDate.getMonth() + 1 : new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth);

  useEffect(() => {
    if (currentViewDate) {
      setSelectedYear(currentViewDate.getFullYear());
      setSelectedMonth(currentViewDate.getMonth() + 1);
    }
  }, [currentViewDate]);

  const availableYears = useMemo(() => {
    const years = new Set<number>([new Date().getFullYear()]);
    if (Array.isArray(transactions)) {
      transactions.forEach(t => {
        if (t.date) {
          const d = new Date(t.date);
          if (!isNaN(d.getTime())) {
            years.add(d.getFullYear());
          }
        }
      });
    }
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  const filteredAndSortedTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions
      .filter(t => {
        if (!t.date) return false;
        const d = new Date(t.date);
        if (isNaN(d.getTime())) return false;
        return d.getFullYear() === selectedYear && (d.getMonth() + 1) === selectedMonth;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedYear, selectedMonth]);

  const totalIncome = filteredAndSortedTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredAndSortedTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Sticky Header Filters */}
      <div className="p-4 bg-gray-50 border-b border-gray-100 shrink-0 z-10">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs rounded-lg pl-3 pr-7 py-2 focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer shadow-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}년</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-xs rounded-lg pl-3 pr-7 py-2 focus:ring-2 focus:ring-indigo-500 font-bold cursor-pointer shadow-sm"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>{month}월</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {filteredAndSortedTransactions.length} 건의 내역
          </div>
        </div>
        
        <div className="flex gap-2">
           <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase flex-1 text-center shadow-inner">
             수입 {totalIncome.toLocaleString()}원
           </div>
           <div className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-[10px] font-black uppercase flex-1 text-center shadow-inner">
             지출 {totalExpense.toLocaleString()}원
           </div>
        </div>
      </div>

      {/* Scrollable List Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredAndSortedTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <Filter size={48} className="opacity-10 mb-3" />
            <p className="text-xs font-bold">표시할 내역이 없습니다.</p>
          </div>
        ) : (
          filteredAndSortedTransactions.map((t) => (
            <div key={t.id} className="group flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl hover:shadow-lg hover:border-indigo-100 transition-all relative">
              <div className="flex items-center gap-4">
                <div className={`${t.type === 'income' ? 'text-blue-500' : 'text-red-500'} shrink-0`}>
                  {t.type === 'income' ? <ArrowUpCircle size={32} strokeWidth={2.5} /> : <ArrowDownCircle size={32} strokeWidth={2.5} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-gray-800 text-sm truncate">{t.category}</p>
                    {t.bank && (
                      <span className="text-[9px] px-1.5 py-0.5 bg-gray-50 text-gray-400 rounded-md border border-gray-100 flex items-center gap-1 shrink-0 font-bold">
                        <CreditCard size={10} />
                        {t.bank}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400 truncate font-medium">
                    {t.date} {t.description && `• ${t.description}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <span className={`font-black text-sm whitespace-nowrap ${t.type === 'income' ? 'text-blue-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString()}
                </span>
                
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(t)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f9fafb; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `}</style>
    </div>
  );
};