
import React, { useState, useEffect } from 'react';
import { PlusCircle, Save, X } from 'lucide-react';
import { Transaction, TransactionType, BANK_LIST } from '../types';

interface Props {
  onAddTransaction: (t: Omit<Transaction, 'id'>) => void;
  onUpdateTransaction?: (t: Transaction) => void;
  editingTransaction?: Transaction | null;
  onCancelEdit?: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  onOpenCategoryManager: () => void;
  currentViewDate: Date;
}

export const TransactionForm: React.FC<Props> = ({ 
  onAddTransaction, 
  onUpdateTransaction,
  editingTransaction,
  onCancelEdit,
  incomeCategories, 
  expenseCategories,
  onOpenCategoryManager,
  currentViewDate
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  
  // Helper to get local YYYY-MM-DD string safely
  const getLocalDateString = (d: Date) => {
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().split('T')[0];
  };

  const [date, setDate] = useState<string>(getLocalDateString(new Date()));
  const [category, setCategory] = useState<string>('');
  const [bank, setBank] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const categories = type === 'expense' ? expenseCategories : incomeCategories;

  // Populate form when editingTransaction changes
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setDate(editingTransaction.date);
      setCategory(editingTransaction.category);
      setBank(editingTransaction.bank || '');
      setDescription(editingTransaction.description || '');
    } else {
      setAmount('');
      setDescription('');
      setBank('');
      // Date reset logic is handled by the currentViewDate effect below
    }
  }, [editingTransaction]);

  // Sync form date with the dashboard's current view date
  useEffect(() => {
    // If we are currently editing a transaction, do NOT override the date with the view date
    if (editingTransaction) return;

    const now = new Date();
    const isCurrentMonth = 
      now.getFullYear() === currentViewDate.getFullYear() && 
      now.getMonth() === currentViewDate.getMonth();

    if (isCurrentMonth) {
      // If viewing current month, default to today
      setDate(getLocalDateString(now));
    } else {
      // If viewing another month, default to the 1st of that month
      const viewFirstDay = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), 1);
      setDate(getLocalDateString(viewFirstDay));
    }
  }, [currentViewDate, editingTransaction]);

  // Ensure category is valid when switching types or categories change
  useEffect(() => {
    // Only auto-select if we aren't editing, or if the editing category is invalid
    if (!editingTransaction && categories.length > 0 && !categories.includes(category)) {
      setCategory(categories[0]);
    } else if (categories.length === 0) {
        setCategory('');
    }
    // If editing, we trust the effect above to set the category, but we still need to validate existence
    // if the user deleted that category. For now, keep as is to allow viewing old categories.
  }, [type, categories, category, editingTransaction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !date || !category || !bank) return;

    const txData = {
      type,
      amount: parseInt(amount.replace(/,/g, ''), 10),
      date,
      category,
      bank,
      description,
    };

    if (editingTransaction && onUpdateTransaction) {
      onUpdateTransaction({
        ...txData,
        id: editingTransaction.id
      });
    } else {
      onAddTransaction(txData);
    }

    // Reset form only if not editing (or if editing is done, handled by parent prop change)
    if (!editingTransaction) {
      setAmount('');
      setDescription('');
      setBank('');
    }
  };

  const isEditing = !!editingTransaction;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 relative">
      {isEditing && (
        <div className="absolute -top-3 -right-2">
            <button 
                type="button" 
                onClick={onCancelEdit}
                className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 shadow-sm border border-gray-100"
            >
                <X size={16} />
            </button>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType('income')}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            type === 'income' 
              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          수입
        </button>
        <button
          type="button"
          onClick={() => setType('expense')}
          className={`py-2 px-4 rounded-lg font-medium transition-colors ${
            type === 'expense' 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
        >
          지출
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">날짜</label>
          <input
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 bg-white"
          />
        </div>
        <div>
           <label className="block text-xs font-medium text-gray-500 mb-1">자산/계좌</label>
           <input 
             list="bank-options"
             value={bank}
             onChange={(e) => setBank(e.target.value)}
             placeholder="예: 하나은행 1234"
             required
             className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 bg-white"
           />
           <datalist id="bank-options">
             {BANK_LIST.map(b => <option key={b} value={b} />)}
           </datalist>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">금액</label>
        <div className="relative">
          <input
            type="number"
            required
            min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 bg-white"
          />
          <span className="absolute right-3 top-2 text-gray-400 text-sm">원</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-medium text-gray-500">카테고리</label>
          <button 
            type="button" 
            onClick={onOpenCategoryManager}
            className="text-xs text-indigo-600 hover:text-indigo-800 underline"
          >
            관리
          </button>
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
          {categories.length === 0 && <option value="">카테고리를 추가해주세요</option>}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">내용 (선택)</label>
        <input
          type="text"
          placeholder="점심식사, 월급 등"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border-gray-300 border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 bg-white"
        />
      </div>

      <div className="flex gap-2">
        {isEditing && (
            <button
                type="button"
                onClick={onCancelEdit}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                취소
            </button>
        )}
        <button
            type="submit"
            disabled={categories.length === 0}
            className={`flex-1 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isEditing 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300'
            }`}
        >
            {isEditing ? (
                <>
                    <Save size={18} />
                    수정 저장
                </>
            ) : (
                <>
                    <PlusCircle size={18} />
                    추가하기
                </>
            )}
        </button>
      </div>
    </form>
  );
};
