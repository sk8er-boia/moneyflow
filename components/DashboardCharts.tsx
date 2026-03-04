
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Transaction } from '../types';
import { ChartDetailModal } from './ChartDetailModal';

interface Props {
  currentMonthTransactions: Transaction[];
  allTransactions?: Transaction[]; 
  year?: number; 
}

const COLORS = ['#6366f1', '#ec4899', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#6b7280'];

export const DashboardCharts: React.FC<Props> = ({ currentMonthTransactions }) => {
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; title: string; data: Transaction[] }>({
    isOpen: false,
    title: '',
    data: [],
  });

  // --- 1. Daily Flow (Current Month) ---
  const dailyDataMap = new Map<string, { date: string; income: number; expense: number }>();
  currentMonthTransactions.forEach(t => {
    const day = t.date.split('-')[2];
    const existing = dailyDataMap.get(day) || { date: day, income: 0, expense: 0 };
    if (t.type === 'income') existing.income += t.amount;
    else existing.expense += t.amount;
    dailyDataMap.set(day, existing);
  });
  const dailyData = Array.from(dailyDataMap.values()).sort((a, b) => parseInt(a.date) - parseInt(b.date));

  // --- 2. Income Category Breakdown ---
  const incomeCategoryMap = new Map<string, number>();
  let totalIncome = 0;
  currentMonthTransactions.filter(t => t.type === 'income').forEach(t => {
    const existing = incomeCategoryMap.get(t.category) || 0;
    incomeCategoryMap.set(t.category, existing + t.amount);
    totalIncome += t.amount;
  });
  const incomeData = Array.from(incomeCategoryMap.entries())
    .map(([name, value]) => ({ 
      name, 
      value,
      percent: totalIncome > 0 ? (value / totalIncome) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  // --- 3. Expense Category Breakdown ---
  const expenseCategoryMap = new Map<string, number>();
  let totalExpense = 0;
  currentMonthTransactions.filter(t => t.type === 'expense').forEach(t => {
    const existing = expenseCategoryMap.get(t.category) || 0;
    expenseCategoryMap.set(t.category, existing + t.amount);
    totalExpense += t.amount;
  });
  const expenseData = Array.from(expenseCategoryMap.entries())
    .map(([name, value]) => ({ 
      name, 
      value,
      percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0
    }))
    .sort((a, b) => b.value - a.value);

  const hasMonthlyData = currentMonthTransactions.length > 0;

  // --- Click Handlers ---
  const handleBarClick = (data: any) => {
    if (!data || !data.activePayload) return;
    const clickedDay = data.activePayload[0].payload.date;
    const dayTransactions = currentMonthTransactions.filter(t => t.date.split('-')[2] === clickedDay);
    setModalConfig({
        isOpen: true,
        title: `${clickedDay}일 상세 내역`,
        data: dayTransactions
    });
  };

  const handlePieClick = (data: any, type: 'income' | 'expense') => {
      if (!data) return;
      const categoryName = data.name; 
      const categoryTransactions = currentMonthTransactions.filter(
          t => t.type === type && t.category === categoryName
      );
      setModalConfig({
          isOpen: true,
          title: `${categoryName} ${type === 'income' ? '수입' : '지출'} 상세`,
          data: categoryTransactions
      });
  };

  const renderLegend = (payload: any, data: any[]) => {
    if (!payload || !Array.isArray(payload)) return null;
    return (
      <ul className="flex flex-col gap-1 text-[10px] text-gray-600 ml-2 overflow-y-auto max-h-[140px] custom-scrollbar pr-1">
        {payload.map((entry: any, index: number) => {
            const dataItem = data.find(c => c.name === entry.value);
            const percent = dataItem ? dataItem.percent.toFixed(1) : '0.0';
            return (
                <li key={`item-${index}`} className="flex items-center gap-1.5 whitespace-nowrap">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="font-medium text-gray-700 truncate max-w-[60px]" title={entry.value}>{entry.value}</span>
                    <span className="text-gray-400">({percent}%)</span>
                </li>
            );
        })}
      </ul>
    );
  };

  return (
    <>
        {/* 1. Income Breakdown */}
        <div className="h-64 w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-1 px-1">
            <h4 className="text-sm font-semibold text-gray-600">수입 분석</h4>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">클릭 상세</span>
          </div>
          <div className="flex-1 min-h-0">
            {incomeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomeData}
                    cx="40%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(data) => handlePieClick(data, 'income')}
                    className="cursor-pointer"
                  >
                    {incomeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} contentStyle={{fontSize: '12px', padding: '4px 8px'}} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right" 
                    content={({ payload }) => renderLegend(payload || [], incomeData)}
                    wrapperStyle={{ width: '50%' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">수입 내역 없음</div>
            )}
          </div>
        </div>

        {/* 2. Expense Breakdown */}
        <div className="h-64 w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-1 px-1">
            <h4 className="text-sm font-semibold text-gray-600">지출 분석</h4>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">클릭 상세</span>
          </div>
          <div className="flex-1 min-h-0">
            {expenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    cx="40%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(data) => handlePieClick(data, 'expense')}
                    className="cursor-pointer"
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} contentStyle={{fontSize: '12px', padding: '4px 8px'}} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right" 
                    content={({ payload }) => renderLegend(payload || [], expenseData)}
                    wrapperStyle={{ width: '50%' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-xs">지출 내역 없음</div>
            )}
          </div>
        </div>

        {/* 3. Daily Flow */}
        <div className="h-64 w-full bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group flex flex-col transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-1 px-1">
            <h4 className="text-sm font-semibold text-gray-600">일별 흐름</h4>
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">클릭 상세</span>
          </div>
          <div className="flex-1 min-h-0">
            {hasMonthlyData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 5, bottom: 0, left: -25 }} onClick={handleBarClick} className="cursor-pointer">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8f8f8" />
                  <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <YAxis tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} tick={{fontSize: 10}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#f3f4f6'}}
                    formatter={(value: number) => [`${value.toLocaleString()}원`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px', padding: '4px 8px' }}
                  />
                  <Bar dataKey="income" name="수입" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={30} />
                  <Bar dataKey="expense" name="지출" fill="#ef4444" radius={[2, 2, 0, 0]} maxBarSize={30} />
                </BarChart>
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
