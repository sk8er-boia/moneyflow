
import React, { useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onSelectMonth: (date: Date) => void;
}

export const MonthlyHistory: React.FC<Props> = ({ isOpen, onClose, transactions, onSelectMonth }) => {
  if (!isOpen) return null;

  // Group transactions by month and calculate stats
  const historyData = useMemo(() => {
    const map = new Map<string, { income: number; expense: number; date: Date }>();

    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const existing = map.get(key) || { income: 0, expense: 0, date: new Date(date.getFullYear(), date.getMonth(), 1) };
      
      if (t.type === 'income') {
        existing.income += t.amount;
      } else {
        existing.expense += t.amount;
      }
      map.set(key, existing);
    });

    // Sort by date ascending to calculate accumulation
    const sortedKeys = Array.from(map.keys()).sort();
    
    let accumulatedBalance = 0;
    const result = sortedKeys.map(key => {
      const data = map.get(key)!;
      const monthlyBalance = data.income - data.expense;
      accumulatedBalance += monthlyBalance;
      
      return {
        key,
        year: data.date.getFullYear(),
        month: data.date.getMonth() + 1,
        income: data.income,
        expense: data.expense,
        monthlyBalance,
        accumulatedBalance,
        dateObj: data.date
      };
    });

    // Return reversed (newest first) for display
    return result.reverse();
  }, [transactions]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">월별 누적 리포트</h3>
            <p className="text-xs text-gray-500 mt-1">월별 수입/지출 및 누적 자산 흐름을 확인하세요.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {historyData.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Wallet size={48} className="mx-auto mb-4 opacity-20" />
              <p>아직 기록된 데이터가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {historyData.map((data) => (
                <div 
                  key={data.key} 
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden"
                  onClick={() => {
                    onSelectMonth(data.dateObj);
                    onClose();
                  }}
                >
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    
                    {/* Month Info */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="bg-indigo-50 text-indigo-700 font-bold rounded-lg p-3 text-center min-w-[70px]">
                        <span className="text-xs block text-indigo-400">{data.year}</span>
                        <span className="text-xl">{data.month}월</span>
                      </div>
                      <div className="flex-1">
                         <div className="flex items-center gap-3 text-sm mb-1">
                           <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                             <TrendingUp size={12} /> {data.income.toLocaleString()}
                           </span>
                           <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                             <TrendingDown size={12} /> {data.expense.toLocaleString()}
                           </span>
                         </div>
                         <div className="text-gray-500 text-xs">
                           월 잔액: <span className={`font-semibold ${data.monthlyBalance >= 0 ? 'text-gray-700' : 'text-red-500'}`}>
                             {data.monthlyBalance > 0 ? '+' : ''}{data.monthlyBalance.toLocaleString()}원
                           </span>
                         </div>
                      </div>
                    </div>

                    {/* Accumulated Balance */}
                    <div className="text-right w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-2 sm:mt-0 flex sm:block justify-between items-center">
                       <span className="text-xs text-gray-400 block mb-1">누적 잔액</span>
                       <div className={`text-lg font-bold ${data.accumulatedBalance >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>
                         {data.accumulatedBalance.toLocaleString()}원
                       </div>
                    </div>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-400">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
