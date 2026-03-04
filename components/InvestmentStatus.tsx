
import React, { useState, useMemo, useEffect } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, PieChart, Pie, Cell } from 'recharts';
import { Save, TrendingUp, TrendingDown } from 'lucide-react';
import { InvestmentRecord } from '../types';

interface Props {
  records: InvestmentRecord[];
  brokers: string[];
  onAddRecord: (record: Omit<InvestmentRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  currentViewDate: Date;
}

const COLORS = ['#60a5fa', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#f472b6', '#2dd4bf', '#fb923c'];

export const InvestmentStatus: React.FC<Props> = ({ records, brokers, onAddRecord, onDeleteRecord, currentViewDate }) => {
  const [broker, setBroker] = useState<string>(brokers[0] || '');
  const [amount, setAmount] = useState<string>('');

  useEffect(() => {
    if (!brokers.includes(broker) && brokers.length > 0) {
      setBroker(brokers[0]);
    }
  }, [brokers]);
  
  const formatDate = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>(formatDate(new Date()));

  useEffect(() => {
    const now = new Date();
    const isCurrentMonth = 
      now.getFullYear() === currentViewDate.getFullYear() && 
      now.getMonth() === currentViewDate.getMonth();

    if (isCurrentMonth) {
      setDate(formatDate(now));
    } else {
      const viewFirstDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
      setDate(formatDate(viewFirstDay));
    }
  }, [currentViewDate]);

  const setQuickDate = (dayType: '1' | '15' | 'end') => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth(); 
    let targetDate: Date;
    if (dayType === '1') {
      targetDate = new Date(year, month, 1);
    } else if (dayType === '15') {
      targetDate = new Date(year, month, 15);
    } else {
      targetDate = new Date(year, month + 1, 0);
    }
    setDate(formatDate(targetDate));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !broker) return;
    onAddRecord({
      date,
      broker,
      amount: parseInt(amount.replace(/,/g, ''), 10)
    });
    setAmount('');
  };

  // Helper to check if a date string is the last day of its month
  const isLastDayOfMonth = (dateStr: string) => {
      const d = new Date(dateStr);
      const nextDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
      return nextDay.getDate() === 1;
  };

  // Calculate Chart Data for the Selected Year (Full Year Trend)
  const chartData = useMemo(() => {
    const currentYear = currentViewDate.getFullYear();
    const dataMap = new Map<string, any>();

    // 1. Collect all unique dates in the current year
    records.forEach(r => {
        if (new Date(r.date).getFullYear() === currentYear) {
            if (!dataMap.has(r.date)) {
                dataMap.set(r.date, { date: r.date, total: 0 });
            }
        }
    });

    const sortedDates = Array.from(dataMap.keys()).sort();

    // 2. Build data points with interpolation logic
    const finalData = sortedDates.map(d => {
        const item: any = { date: d };
        let total = 0;

        brokers.forEach(b => {
            const exactMatch = records.find(r => r.date === d && r.broker === b);
            if (exactMatch) {
                item[b] = exactMatch.amount;
            } else {
                const prevRecords = records
                    .filter(r => r.broker === b && r.date < d)
                    .sort((a,b) => b.date.localeCompare(a.date));
                
                if (prevRecords.length > 0) {
                     item[b] = prevRecords[0].amount;
                } else {
                     item[b] = 0;
                }
            }
            total += (item[b] || 0);
        });
        
        item.total = total;
        return item;
    });

    return finalData;
  }, [records, currentViewDate, brokers]);

  // Calculate Yearly Return
  const yearlyStats = useMemo(() => {
      if (chartData.length < 2) return null;
      const start = chartData[0].total;
      const end = chartData[chartData.length - 1].total;
      const diff = end - start;
      const percent = start > 0 ? (diff / start) * 100 : 0;
      return { diff, percent };
  }, [chartData]);

  // Current Totals for Pie Chart
  const currentTotals = useMemo<{ [key: string]: number }>(() => {
      const totals: {[key: string]: number} = {};
      brokers.forEach(b => {
          const brokerRecords = records.filter(r => r.broker === b).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          totals[b] = brokerRecords.length > 0 ? brokerRecords[0].amount : 0;
      });
      return totals;
  }, [records, brokers]);

  const totalAssets = brokers.reduce((sum, b) => sum + (currentTotals[b] || 0), 0);
  
  const pieData = useMemo(() => {
    if (totalAssets === 0) return [];
    return brokers.map((b, i) => ({
        name: b,
        value: currentTotals[b] || 0,
        color: COLORS[i % COLORS.length]
    })).filter(d => d.value > 0);
  }, [currentTotals, totalAssets, brokers]);

  // Formatters
  const formatXAxis = (dateStr: string) => {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length < 3) return dateStr;
      const d = parseInt(parts[2]);
      const m = parseInt(parts[1]).toString(); 
      if (d === 1) return `${m}.1`;
      if (d === 15) return `${m}.15`;
      if (isLastDayOfMonth(dateStr)) return `${m}.말`;
      return `${m}.${d}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-64 overflow-hidden transition-all hover:shadow-md">
        {/* Header Section */}
        <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
             <div>
                <h3 className="font-semibold text-gray-800 text-sm">투자 자산 현황 <span className="text-gray-400 font-normal text-xs">({currentViewDate.getFullYear()})</span></h3>
                {yearlyStats ? (
                    <div className={`flex items-center gap-1 text-[10px] font-medium ${yearlyStats.diff >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                        {yearlyStats.diff >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        <span>연초 대비 {yearlyStats.diff > 0 ? '+' : ''}{yearlyStats.diff.toLocaleString()}원 ({yearlyStats.percent.toFixed(1)}%)</span>
                    </div>
                ) : (
                    <div className="text-[10px] text-gray-400">데이터를 입력하여 자산 추이를 확인하세요</div>
                )}
             </div>
             <span className="text-lg font-bold text-indigo-900">{totalAssets.toLocaleString()}원</span>
        </div>

        <div className="flex flex-1 min-h-0">
            {/* Left: Pie Chart (Composition) */}
            <div className="w-[35%] h-full relative border-r border-gray-50 p-2 flex flex-col items-center justify-between">
                <h4 className="absolute top-2 left-2 text-[10px] font-bold text-gray-500">자산 비중</h4>
                
                {/* Chart Container */}
                <div className="flex-1 w-full min-h-0 mt-4">
                    {totalAssets > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={20}
                                    outerRadius={35}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} contentStyle={{fontSize: '11px', padding: '4px'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-300">데이터 없음</div>
                    )}
                </div>

                {/* Legend */}
                <div className="flex flex-col gap-1 w-full px-2 mt-1 mb-1 max-h-16 overflow-y-auto custom-scrollbar">
                    {brokers.map((b, i) => (
                        <div key={b} className="flex justify-between items-center text-[10px]">
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                <span className="text-gray-600 truncate max-w-[40px]">{b}</span>
                            </div>
                            <span className="font-medium text-gray-800">{totalAssets > 0 ? ((currentTotals[b]/totalAssets)*100).toFixed(0) : 0}%</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Composed Chart (Trend) */}
            <div className="w-[65%] h-full p-2 pl-0">
                 <div className="w-full h-full relative">
                    <h4 className="absolute top-0 right-2 text-[10px] font-bold text-gray-500 z-10">{currentViewDate.getFullYear()} 연간 추이</h4>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData} margin={{ top: 15, right: 10, bottom: 0, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatXAxis} 
                                    tick={{fontSize: 9, fill: '#9ca3af'}} 
                                    interval="preserveStartEnd"
                                    minTickGap={15}
                                    tickLine={false} 
                                    axisLine={false}
                                />
                                <YAxis 
                                    tickFormatter={(val) => `${(val/10000).toFixed(0)}만`} 
                                    tick={{fontSize: 9, fill: '#9ca3af'}} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    formatter={(value: number, name: string) => [
                                        `${value.toLocaleString()}원`, 
                                        name === 'total' ? '총 자산' : name
                                    ]}
                                    labelFormatter={(label) => formatXAxis(label as string)}
                                    contentStyle={{fontSize: '11px', padding: '6px', borderRadius: '8px'}} 
                                />
                                {brokers.map((b, i) => (
                                    <Bar 
                                        key={b}
                                        dataKey={b} 
                                        stackId="a" 
                                        fill={COLORS[i % COLORS.length]} 
                                        barSize={40} 
                                        radius={i === brokers.length - 1 ? [2, 2, 0, 0] : i === 0 ? [0, 0, 2, 2] : [0, 0, 0, 0]}
                                    >
                                        <LabelList dataKey={b} position="center" fill="#fff" fontSize={9} fontWeight="bold" formatter={(val: number) => {
                                            if (val === 0) return '';
                                            const total = chartData.find(d => d[b] === val)?.total || 1;
                                            const percent = (val/total)*100;
                                            return percent > 15 ? percent.toFixed(0) + '%' : '';
                                        }} />
                                    </Bar>
                                ))}
                                <Line 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#1e3a8a" 
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                    dot={{ r: 2, fill: '#1e3a8a', stroke: '#fff' }} 
                                    activeDot={{ r: 4 }} 
                                />
                            </ComposedChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 text-xs">
                           <TrendingUp size={16} className="opacity-20 mb-1" />
                           <p>기록 없음</p>
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-gray-100 p-2 bg-gray-50/30 shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2 items-center">
                 <select 
                    value={broker} 
                    onChange={(e) => setBroker(e.target.value)}
                    className="text-[10px] border border-gray-200 rounded px-1 py-1 bg-white focus:ring-1 focus:ring-indigo-500 outline-none w-16 text-gray-900"
                 >
                     {brokers.map(b => <option key={b} value={b}>{b}</option>)}
                 </select>
                 
                 <div className="flex border border-gray-200 rounded bg-white overflow-hidden">
                     <button type="button" onClick={() => setQuickDate('1')} className="px-1.5 py-1 text-[9px] hover:bg-indigo-50 text-gray-600 border-r border-gray-100">1일</button>
                     <button type="button" onClick={() => setQuickDate('15')} className="px-1.5 py-1 text-[9px] hover:bg-indigo-50 text-gray-600 border-r border-gray-100">15일</button>
                     <button type="button" onClick={() => setQuickDate('end')} className="px-1.5 py-1 text-[9px] hover:bg-indigo-50 text-gray-600">말일</button>
                 </div>

                 <input 
                    type="date" 
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-20 text-[10px] border border-gray-200 rounded px-1 py-1 outline-none font-mono text-gray-900 bg-white"
                />
                
                <input 
                    type="text" 
                    placeholder="금액"
                    required
                    value={amount}
                    onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setAmount(val ? parseInt(val).toLocaleString() : '');
                    }}
                    className="flex-1 text-[10px] border border-gray-200 rounded px-2 py-1 outline-none font-medium text-gray-900 bg-white min-w-0"
                />
                <button type="submit" disabled={!broker} className="bg-indigo-600 text-white p-1 rounded hover:bg-indigo-700 transition-colors shrink-0 disabled:bg-gray-300">
                    <Save size={14} />
                </button>
            </form>
        </div>
    </div>
  );
};
