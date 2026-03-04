
import React, { useState, useMemo, useEffect } from 'react';
import { Bell, Calendar, Plus, Trash2, Sparkles, Loader2, TrendingUp, AlertCircle, CheckCircle, Edit2, Save, X } from 'lucide-react';
import { RecurringExpense, Transaction } from '../types';
import { Card } from './ui/Card';
import { predictNextMonthExpenses, PredictionResult } from '../services/geminiService';

interface Props {
  expenses: RecurringExpense[];
  onAdd: (expense: Omit<RecurringExpense, 'id'>) => void;
  onUpdate: (expense: RecurringExpense) => void;
  onDelete: (id: string) => void;
  onPay: (expense: RecurringExpense) => void;
  currentViewDate: Date; // Use this to check status against the viewed month
  transactions: Transaction[]; // Required for AI prediction and checking paid status
  categories: string[];
}

export const UpcomingBills: React.FC<Props> = ({ expenses, onAdd, onUpdate, onDelete, onPay, currentViewDate, transactions, categories }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newDay, setNewDay] = useState('1');
  const [newCategory, setNewCategory] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editDay, setEditDay] = useState('1');
  const [editCategory, setEditCategory] = useState('');

  // AI Prediction State
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictionError, setPredictionError] = useState<string | null>(null);
  const [showPrediction, setShowPrediction] = useState(false);

  // Initialize new category default
  useEffect(() => {
    if (categories.length > 0 && !newCategory) {
        setNewCategory(categories[0]);
    }
  }, [categories]);

  const processedExpenses = useMemo(() => {
    const today = new Date();
    const isCurrentMonthView = 
        today.getFullYear() === currentViewDate.getFullYear() && 
        today.getMonth() === currentViewDate.getMonth();
    
    const currentDay = isCurrentMonthView ? today.getDate() : 1; 

    return expenses.map(e => {
      let diff = e.day - currentDay;
      let status: 'today' | 'upcoming' | 'passed' | 'future_view' = 'upcoming';
      
      if (!isCurrentMonthView) {
        status = 'future_view';
      } else {
        if (diff === 0) status = 'today';
        else if (diff < 0) {
            status = 'passed';
        }
      }

      // Check if this expense is already paid for the current view month
      const isPaid = transactions.some(t => {
          const tDate = new Date(t.date);
          const sameMonth = tDate.getFullYear() === currentViewDate.getFullYear() &&
                            tDate.getMonth() === currentViewDate.getMonth();
          
          return sameMonth && 
                 t.type === 'expense' && 
                 t.description === e.name; 
      });

      return { ...e, diff, status, isPaid };
    }).sort((a, b) => {
        if (!a.isPaid && b.isPaid) return -1;
        if (a.isPaid && !b.isPaid) return 1;

        if (a.status === 'today') return -1;
        if (b.status === 'today') return 1;
        
        if (!isCurrentMonthView) return a.day - b.day;
        
        if (a.status === 'upcoming' && b.status === 'upcoming') return a.day - b.day;
        if (a.status === 'upcoming' && b.status === 'passed') return -1; 
        if (a.status === 'passed' && b.status === 'upcoming') return 1;
        return a.day - b.day;
    });
  }, [expenses, currentViewDate, transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newAmount || !newDay || !newCategory) return;

    onAdd({
      name: newName,
      amount: parseInt(newAmount.replace(/,/g, ''), 10),
      day: parseInt(newDay, 10),
      category: newCategory
    });

    setNewName('');
    setNewAmount('');
    setIsAdding(false);
  };

  const startEditing = (item: RecurringExpense) => {
      setEditingId(item.id);
      setEditName(item.name);
      setEditAmount(item.amount.toString());
      setEditDay(item.day.toString());
      setEditCategory(item.category || categories[0] || '기타');
  };

  const cancelEditing = () => {
      setEditingId(null);
  };

  const saveEditing = (originalId: string) => {
      if (!editName || !editAmount || !editDay || !editCategory) return;
      onUpdate({
          id: originalId,
          name: editName,
          amount: parseInt(editAmount.replace(/,/g, ''), 10),
          day: parseInt(editDay, 10),
          category: editCategory
      });
      setEditingId(null);
  };

  const handlePredict = async () => {
    if (transactions.length < 5) {
      setPredictionError("예측 정확도를 위해 최소 5건 이상의 지출 데이터가 필요합니다.");
      setShowPrediction(true);
      return;
    }

    setIsPredicting(true);
    setPredictionError(null);
    setShowPrediction(true);
    
    try {
      const prediction = await predictNextMonthExpenses(transactions);
      setPredictionResult(prediction);
    } catch (e) {
      setPredictionError("예측을 생성하는 중 문제가 발생했습니다.");
    } finally {
      setIsPredicting(false);
    }
  };

  const isCurrentMonthView = 
    new Date().getFullYear() === currentViewDate.getFullYear() && 
    new Date().getMonth() === currentViewDate.getMonth();

  const upcomingCount = isCurrentMonthView 
    ? processedExpenses.filter(e => !e.isPaid && (e.status === 'today' || (e.status === 'upcoming' && e.diff <= 7))).length
    : 0;

  return (
    <Card 
      title="지출 예정 & 예측" 
      className="h-auto"
      action={
        <button 
          type="button"
          onClick={(e) => { e.preventDefault(); setIsAdding(!isAdding); }} 
          className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-md transition-colors z-10 relative"
        >
          {isAdding ? '목록 보기' : <><Plus size={14}/> 추가</>}
        </button>
      }
    >
      {isCurrentMonthView && upcomingCount > 0 && !isAdding && (
        <div className="mb-4 bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex items-start gap-3 animate-in slide-in-from-top-2">
            <Bell className="text-indigo-600 shrink-0 mt-0.5" size={16} />
            <div>
                <p className="text-sm font-bold text-indigo-800">
                    결제 예정인 지출이 {upcomingCount}건 있습니다.
                </p>
                <p className="text-xs text-indigo-600 mt-0.5">버튼을 눌러 지출 처리를 완료하세요.</p>
            </div>
        </div>
      )}

      {isAdding ? (
        <form onSubmit={handleSubmit} className="space-y-3 animate-in fade-in mb-4">
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">지출 내역 (예: 월세, 넷플릭스)</label>
                <input 
                    type="text" 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                    placeholder="항목 이름"
                />
            </div>
            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">금액</label>
                    <input 
                        type="number" 
                        required
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        placeholder="0"
                    />
                </div>
                <div className="w-24">
                    <label className="block text-xs font-medium text-gray-500 mb-1">매월 결제일</label>
                    <select 
                        value={newDay}
                        onChange={(e) => setNewDay(e.target.value)}
                        className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    >
                        {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                            <option key={d} value={d.toString()}>{d}일</option>
                        ))}
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">카테고리</label>
                <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                >
                    {categories.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                    {!newCategory && <option value="">선택</option>}
                </select>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                알림 등록
            </button>
        </form>
      ) : (
        <>
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar mb-4">
                {processedExpenses.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                        <Calendar className="mx-auto mb-2 opacity-30" size={24} />
                        <p>등록된 고정 지출이 없습니다.</p>
                    </div>
                ) : (
                    processedExpenses.map(item => {
                        if (editingId === item.id) {
                            return (
                                <div key={item.id} className="p-3 rounded-xl border border-indigo-200 bg-indigo-50 space-y-2 relative z-10">
                                     <div>
                                        <input 
                                            type="text" 
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full text-xs border border-indigo-300 rounded px-2 py-1 outline-none mb-1 text-gray-900 bg-white"
                                            placeholder="이름"
                                        />
                                     </div>
                                     <div className="flex gap-1">
                                         <input 
                                            type="number" 
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            className="flex-1 text-xs border border-indigo-300 rounded px-2 py-1 outline-none text-gray-900 bg-white"
                                            placeholder="금액"
                                        />
                                         <select 
                                            value={editDay}
                                            onChange={(e) => setEditDay(e.target.value)}
                                            className="w-16 text-xs border border-indigo-300 rounded px-1 py-1 outline-none bg-white text-gray-900"
                                        >
                                            {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                                                <option key={d} value={d.toString()}>{d}일</option>
                                            ))}
                                        </select>
                                     </div>
                                     <div>
                                         <select 
                                            value={editCategory}
                                            onChange={(e) => setEditCategory(e.target.value)}
                                            className="w-full text-xs border border-indigo-300 rounded px-2 py-1 outline-none bg-white text-gray-900"
                                        >
                                            {categories.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                     </div>
                                     <div className="flex gap-2 mt-1">
                                         <button onClick={() => saveEditing(item.id)} className="flex-1 bg-indigo-600 text-white text-xs py-1 rounded hover:bg-indigo-700 flex items-center justify-center gap-1 cursor-pointer"><Save size={12}/> 저장</button>
                                         <button onClick={cancelEditing} className="flex-1 bg-gray-200 text-gray-700 text-xs py-1 rounded hover:bg-gray-300 flex items-center justify-center gap-1 cursor-pointer"><X size={12}/> 취소</button>
                                     </div>
                                </div>
                            );
                        }

                        let badgeClass = "bg-gray-100 text-gray-500";
                        let badgeText = `매월 ${item.day}일`;
                        let itemClass = "bg-white border-gray-100";

                        if (item.isPaid) {
                            badgeText = "지출 완료";
                            badgeClass = "bg-emerald-100 text-emerald-600 font-medium";
                            itemClass = "bg-gray-50/50 border-gray-100 opacity-70";
                        } else if (item.status === 'today') {
                            badgeClass = "bg-red-100 text-red-600 font-bold animate-pulse";
                            badgeText = "오늘 결제일";
                            itemClass = "bg-red-50/50 border-red-100";
                        } else if (item.status === 'upcoming' && item.diff <= 3 && isCurrentMonthView) {
                             badgeClass = "bg-orange-100 text-orange-600 font-bold";
                             badgeText = `D-${item.diff}`;
                        } else if (item.status === 'passed') {
                            badgeText = "미처리";
                            badgeClass = "bg-gray-100 text-gray-400";
                        }

                        return (
                            <div key={item.id} className={`flex items-center justify-between p-3 rounded-xl border ${itemClass} group transition-all relative`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 ${badgeClass}`}>
                                        <span className="text-[9px] uppercase">DAY</span>
                                        <span className="text-sm font-bold">{item.day}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs text-gray-500">{item.amount.toLocaleString()}원</p>
                                            <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 rounded">{item.category}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.isPaid ? (
                                        <span className={`text-[10px] px-2 py-1 rounded-full flex items-center gap-1 ${badgeClass}`}>
                                            <CheckCircle size={10} /> {badgeText}
                                        </span>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); onPay(item); }}
                                            className="text-[10px] px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors cursor-pointer z-10 relative"
                                            title="지출 내역으로 등록"
                                        >
                                            지출 처리
                                        </button>
                                    )}
                                    
                                    <div className="flex items-center gap-1 ml-1 z-10 relative">
                                        <button 
                                            type="button"
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              startEditing(item); 
                                            }}
                                            className="text-gray-400 hover:text-indigo-500 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="수정"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={(e) => { 
                                              e.stopPropagation(); 
                                              onDelete(item.id); 
                                            }}
                                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                                            title="삭제"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="border-t border-gray-100 pt-4">
                {!showPrediction ? (
                    <button
                        type="button"
                        onClick={handlePredict}
                        className="w-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-medium py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm z-10 relative"
                    >
                        <Sparkles size={16} />
                        AI 다음 달 지출 예측하기
                    </button>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center mb-2">
                             <h4 className="text-xs font-bold text-purple-800 flex items-center gap-1">
                                <Sparkles size={12} /> AI 예측 결과
                            </h4>
                            <button 
                                type="button"
                                onClick={() => setShowPrediction(false)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                            >
                                닫기
                            </button>
                        </div>
                        
                        {isPredicting ? (
                             <div className="text-center py-6">
                                <Loader2 className="animate-spin text-purple-500 mx-auto mb-2" size={24} />
                                <p className="text-xs text-gray-500">지출 패턴 분석 중...</p>
                             </div>
                        ) : predictionResult ? (
                            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                                <div className="text-center mb-3">
                                    <p className="text-xs text-gray-500 mb-1">다음 달 예상 지출</p>
                                    <p className="text-2xl font-bold text-gray-800">
                                        {predictionResult.predictedAmount.toLocaleString()}원
                                    </p>
                                </div>
                                <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-white/50 p-2 rounded-lg">
                                    {predictionResult.reasoning}
                                </p>
                                <button
                                    type="button"
                                    onClick={handlePredict}
                                    className="mt-3 w-full text-xs text-purple-400 hover:text-purple-600 flex items-center justify-center gap-1"
                                >
                                    <TrendingUp size={12} /> 다시 분석하기
                                </button>
                            </div>
                        ) : (
                             <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2 text-xs text-red-600">
                                <AlertCircle size={14} className="shrink-0" />
                                {predictionError || "예측을 불러올 수 없습니다."}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
      )}
    </Card>
  );
};
