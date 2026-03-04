import React, { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { TransactionType } from '../types';

type TabType = TransactionType | 'broker';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  incomeCategories: string[];
  expenseCategories: string[];
  brokers: string[];
  onUpdateCategories: (type: TransactionType, newCategories: string[]) => void;
  onUpdateBrokers: (newBrokers: string[]) => void;
}

export const CategoryManager: React.FC<Props> = ({ 
  isOpen, onClose, incomeCategories, expenseCategories, brokers, onUpdateCategories, onUpdateBrokers 
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('expense');
  const [newItem, setNewItem] = useState('');

  if (!isOpen) return null;

  const items = activeTab === 'income' 
    ? incomeCategories 
    : activeTab === 'expense' 
      ? expenseCategories 
      : brokers;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newItem.trim();
    if (trimmed && !items.includes(trimmed)) {
      if (activeTab === 'broker') {
        onUpdateBrokers([...brokers, trimmed]);
      } else {
        onUpdateCategories(activeTab, [...items, trimmed]);
      }
      setNewItem('');
    }
  };

  const handleDelete = (itemToDelete: string) => {
    const message = activeTab === 'broker' 
      ? `'${itemToDelete}' 증권사를 삭제하시겠습니까?` 
      : `'${itemToDelete}' 카테고리를 삭제하시겠습니까?`;
      
    if (window.confirm(message)) {
      if (activeTab === 'broker') {
        onUpdateBrokers(brokers.filter(b => b !== itemToDelete));
      } else {
        onUpdateCategories(activeTab as TransactionType, items.filter(i => i !== itemToDelete));
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-semibold text-gray-800">설정 관리</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'expense' 
                  ? 'bg-white text-red-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              지출
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'income' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              수입
            </button>
            <button
              onClick={() => setActiveTab('broker')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'broker' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              증권사
            </button>
          </div>

          {/* List */}
          <div className="space-y-2 max-h-60 overflow-y-auto mb-6 pr-1 custom-scrollbar">
            {items.map(item => (
              <div key={item} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 group">
                <span className="text-sm text-gray-700">{item}</span>
                <button 
                  onClick={() => handleDelete(item)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add Form */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder={activeTab === 'broker' ? "새 증권사 이름" : "새 카테고리 이름"}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
            <button 
              type="submit" 
              disabled={!newItem.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
            >
              <Plus size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
