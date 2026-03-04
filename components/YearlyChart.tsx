
import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Transaction } from '../types';
import { ChartDetailModal } from './ChartDetailModal';

interface Props {
  transactions: Transaction[];
  year: number;
}

export const YearlyChart: React.FC<Props> = ({ transactions, year }) => {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; data: Transaction[] }>({
    isOpen: false,
    title: '',
    data: [],
  });

  const yearlyDataMap = new Map<number, { month: string; monthIndex: number; income: number; expense: number }>();
  for(let i=1; i<=12; i++) {
    yearlyDataMap.set(i, { month: `${i}월`, monthIndex: i, income: 0, expense: 0 });
  }

  transactions.forEach(t => {
    const tDate = new Date(t.date);
    if (tDate.getFullYear() === year) {
      const month = tDate.getMonth() + 1;
      const existing = yearlyDataMap.get(month)!;
      if (t.type === 'income') existing.income += t.amount;
      else existing.expense += t.amount;
    }
  });
  const yearlyData = Array.from(yearlyDataMap.values());
  const hasYearlyData = transactions.some(t => new Date(t.date).getFullYear() === year);

  const handleAreaClick = (data: any) => {
      if (!data || !data.activePayload) return;
      const payload = data.activePayload[0].payload;
      const monthIndex = payload.monthIndex; // 1-12
      
      const monthTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getFullYear() === year && (d.getMonth() + 1) === monthIndex;
      });

      setModalConfig({
          isOpen: true,
          title: `${year}년 ${monthIndex}월 상세 내역`,
          data: monthTransactions
      });
  };

  return (
    <>
      <div className="h-64 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group flex flex-col transition-all hover:shadow-md">
        <div className="flex justify-between items-center mb-1">
            <h4 className="text-sm font-semibold text-gray-600">{year}년 추이</h4>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">클릭 상세</span>
        </div>
        <div className="flex-1 min-h-0">
          {hasYearlyData ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={yearlyData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} onClick={handleAreaClick} className="cursor-pointer">
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{fontSize: 10}} interval={1} tickLine={false} axisLine={false} />
                <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} contentStyle={{fontSize: '12px', padding: '4px 8px'}} />
                <Area type="monotone" dataKey="income" name="수입" stroke="#3b82f6" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" name="지출" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">데이터 없음</div>
          )}
        </div>
      </div>
      
      <ChartDetailModal 
          isOpen={modalConfig.isOpen}
          onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
          title={modalConfig.title}
          transactions={modalConfig.data}
      />
    </>
  );
};
