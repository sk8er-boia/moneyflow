
import React, { useState, useMemo } from 'react';
import { Settings, AlertTriangle, AlertCircle, Save, X, PieChart } from 'lucide-react';
import { Transaction, BudgetMap } from '../types';
import { Card } from './ui/Card';

interface Props {
  categories: string[];
  transactions: Transaction[]; // Current month transactions
  budgets: BudgetMap;
  onUpdateBudgets: (newBudgets: BudgetMap) => void;
  className?: string;
}

export const BudgetOverview: React.FC<Props> = ({ 
  categories, 
  transactions, 
  budgets, 
  onUpdateBudgets,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState<BudgetMap>({});

  // Calculate spending per category for current month
  const spendingMap = useMemo(() => {
    const map: { [key: string]: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return map;
  }, [transactions]);

  // Calculate Total Budget and Total Spent
  const totalBudget = useMemo(() => {
    return categories.reduce((sum, cat) => sum + (budgets[cat] || 0), 0);
  }, [categories, budgets]);

  const totalSpent = useMemo(() => {
    return Object.values(spendingMap).reduce((sum: number, val: number) => sum + val, 0);
  }, [spendingMap]);

  const handleStartEdit = () => {
    setEditValues({ ...budgets });
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdateBudgets(editValues);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleInputChange = (category: string, value: string) => {
    const numValue = parseInt(value.replace(/,/g, ''), 10) || 0;
    setEditValues(prev => ({
      ...prev,
      [category]: numValue
    }));
  };

  return (
    <Card 
      title="카테고리별 예산 관리" 
      className={`h-auto ${className}`}
      action={
        !isEditing ? (
          <button onClick={handleStartEdit} className="text-gray-400 hover:text-indigo-600 transition-colors">
            <Settings size={18} />
          </button>
        ) : (
            <div className="flex gap-2">
                 <button onClick={handleSave} className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 p-1 rounded transition-colors">
                    <Save size={18} />
                </button>
                <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 bg-gray-100 p-1 rounded transition-colors">
                    <X size={18} />
                </button>
            </div>
        )
      }
    >
      {/* Total Summary Header */}
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100">
        <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                 <PieChart size={20} />
             </div>
             <div>
                 <p className="text-xs text-gray-500 font-medium">총 예산</p>
                 <p className="text-lg font-bold text-gray-800">{totalBudget.toLocaleString()}원</p>
             </div>
        </div>
        <div className="text-right">
             <p className="text-xs text-gray-500 font-medium">총 지출</p>
             <p className={`text-lg font-bold ${totalSpent > totalBudget && totalBudget > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                 {totalSpent.toLocaleString()}원
             </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {categories.map(cat => {
            const limit = isEditing ? (editValues[cat] || 0) : (budgets[cat] || 0);
            const spent = spendingMap[cat] || 0;
            const percentage = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
            
            // Calculate weight (portion of total budget)
            const weight = totalBudget > 0 ? (limit / totalBudget) * 100 : 0;

            // Status Logic
            const isOverBudget = spent >= limit && limit > 0;
            const isWarning = !isOverBudget && spent >= limit * 0.8 && limit > 0;
            
            // Dynamic Styles
            let containerClass = "p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ";
            let progressBarColor = "bg-emerald-500";
            let textColor = "text-gray-600";
            let icon = null;

            if (isOverBudget) {
                containerClass += "bg-red-50 border-red-200"; 
                progressBarColor = "bg-red-500";
                textColor = "text-red-700 font-semibold";
                icon = <AlertCircle size={16} className="text-red-600" />;
            } else if (isWarning) {
                containerClass += "bg-orange-50 border-orange-200";
                progressBarColor = "bg-orange-500";
                textColor = "text-orange-700 font-medium";
                icon = <AlertTriangle size={16} className="text-orange-500" />;
            } else {
                containerClass += "bg-white border-gray-100 hover:border-indigo-100";
            }

            if (isEditing) {
                containerClass = "p-3 rounded-xl border border-gray-100 bg-white";
                textColor = "text-gray-600";
                icon = null;
            }

            return (
              <div key={cat} className={containerClass}>
                <div className="flex justify-between items-start mb-2 relative z-10">
                  <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        {icon}
                        <span className={`text-sm ${textColor}`}>{cat}</span>
                      </div>
                      {!isEditing && limit > 0 && (
                          <span className="text-[10px] text-gray-400 mt-0.5 ml-0.5">
                              비중 {weight.toFixed(1)}%
                          </span>
                      )}
                  </div>
                  
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                         <input
                            type="number"
                            value={editValues[cat] || ''}
                            onChange={(e) => handleInputChange(cat, e.target.value)}
                            placeholder="0"
                            className="w-24 text-right border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-gray-400 text-xs">원</span>
                    </div>
                  ) : (
                    <div className="text-right">
                       <span className={`text-sm font-bold ${textColor}`}>
                         {spent.toLocaleString()}
                       </span>
                       <span className="text-gray-400 text-xs mx-1">/</span>
                       <span className="text-gray-500 text-xs">
                         {limit > 0 ? `${limit.toLocaleString()}` : '-'}
                       </span>
                    </div>
                  )}
                </div>

                {!isEditing && limit > 0 && (
                  <div className="h-1.5 w-full bg-gray-200/50 rounded-full overflow-hidden mt-2">
                    <div 
                      className={`h-full ${progressBarColor} transition-all duration-500`} 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </Card>
  );
};
