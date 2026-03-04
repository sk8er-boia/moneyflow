import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Wallet, TrendingUp, TrendingDown, 
  Sparkles, Loader2, History, Settings, HelpCircle, Home
} from 'lucide-react';
import introJs from 'intro.js';
import { Transaction, MonthlyStats, EXPENSE_CATEGORIES, INCOME_CATEGORIES, BudgetMap, InvestmentRecord, RecurringExpense, BackupData, DEFAULT_BROKERS } from './types';
import { Card } from './components/ui/Card';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DashboardCharts } from './components/DashboardCharts';
import { YearlyChart } from './components/YearlyChart';
import { CategoryManager } from './components/CategoryManager';
import { DataManagement } from './components/DataManagement';
import { BudgetOverview } from './components/BudgetOverview';
import { MonthlyHistory } from './components/MonthlyHistory';
import { InvestmentStatus } from './components/InvestmentStatus';
import { UpcomingBills } from './components/UpcomingBills';
import { Toast } from './components/ui/Toast';
import { ConfirmDialog } from './components/ui/ConfirmDialog';
import { InstallGuide } from './components/InstallGuide';
import { LandingPage } from './components/LandingPage';
import { LegalModals } from './components/LegalModals';
import { analyzeFinancialData } from './services/geminiService';

const App = () => {
  // --- State Management ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isPersistent, setIsPersistent] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);

  // Strict initializers to avoid undefined references
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('moneyflow_transactions');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Storage load error:", e);
      return [];
    }
  });

  const [investmentRecords, setInvestmentRecords] = useState<InvestmentRecord[]>(() => {
    try {
      const saved = localStorage.getItem('moneyflow_investments');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>(() => {
    try {
      const saved = localStorage.getItem('moneyflow_recurring_bills');
      return saved ? JSON.parse(saved) : [];
    } catch(e) { return []; }
  });

  const [expenseCats, setExpenseCats] = useState<string[]>(() => {
    const saved = localStorage.getItem('moneyflow_expense_categories_v3');
    return saved ? JSON.parse(saved) : EXPENSE_CATEGORIES;
  });

  const [incomeCats, setIncomeCats] = useState<string[]>(() => {
    const saved = localStorage.getItem('moneyflow_income_categories_v3');
    return saved ? JSON.parse(saved) : INCOME_CATEGORIES;
  });

  const [budgets, setBudgets] = useState<BudgetMap>(() => {
    const saved = localStorage.getItem('moneyflow_budgets');
    return saved ? JSON.parse(saved) : {};
  });

  const [brokers, setBrokers] = useState<string[]>(() => {
    const saved = localStorage.getItem('moneyflow_brokers');
    return saved ? JSON.parse(saved) : DEFAULT_BROKERS;
  });

  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type?: 'success'|'error'|'info' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; message: string; onConfirm: () => void }>({
    isOpen: false, message: '', onConfirm: () => {},
  });
  
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem('moneyflow_onboarded');
  });
  const [activeLegalModal, setActiveLegalModal] = useState<'terms' | 'privacy' | 'contact' | null>(null);

  // --- Persistence Hooks ---
  useEffect(() => {
    setIsStorageReady(true);
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then(granted => setIsPersistent(granted));
    }
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (isStorageReady) localStorage.setItem('moneyflow_transactions', JSON.stringify(transactions));
  }, [transactions, isStorageReady]);

  useEffect(() => {
    if (isStorageReady) localStorage.setItem('moneyflow_investments', JSON.stringify(investmentRecords));
  }, [investmentRecords, isStorageReady]);

  useEffect(() => {
    if (isStorageReady) localStorage.setItem('moneyflow_recurring_bills', JSON.stringify(recurringExpenses));
  }, [recurringExpenses, isStorageReady]);

  useEffect(() => {
    localStorage.setItem('moneyflow_expense_categories_v3', JSON.stringify(expenseCats));
  }, [expenseCats]);

  useEffect(() => {
    localStorage.setItem('moneyflow_income_categories_v3', JSON.stringify(incomeCats));
  }, [incomeCats]);

  useEffect(() => {
    localStorage.setItem('moneyflow_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('moneyflow_brokers', JSON.stringify(brokers));
  }, [brokers]);

  // --- Computed Stats ---
  const currentMonthStr = useMemo(() => {
    if (!currentDate) return new Date().toISOString().slice(0, 7);
    const offset = currentDate.getTimezoneOffset() * 60000;
    return new Date(currentDate.getTime() - offset).toISOString().slice(0, 7);
  }, [currentDate]);

  const filteredTransactions = useMemo(() => {
    if (!Array.isArray(transactions)) return [];
    return transactions.filter(t => t.date && t.date.startsWith(currentMonthStr));
  }, [transactions, currentMonthStr]);

  const stats: MonthlyStats = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
      if (curr.type === 'income') {
        acc.totalIncome += curr.amount;
        acc.balance += curr.amount;
      } else {
        acc.totalExpense += curr.amount;
        acc.balance -= curr.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0, balance: 0 });
  }, [filteredTransactions]);

  const showToast = (msg: string, type: 'success'|'error'|'info' = 'success') => setToast({ msg, type });

  // --- Handlers ---
  const handleAddTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const tx: Transaction = { ...newTx, id: Math.random().toString(36).substr(2, 9) };
    setTransactions(prev => [...prev, tx]);
    showToast('내역이 성공적으로 추가되었습니다.');
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    const element = document.getElementById('transaction-form-section');
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updatedTx.id ? updatedTx : t));
    setEditingTransaction(null);
    showToast('내역이 수정되었습니다.');
  };

  const handleDeleteTransaction = (id: string) => {
    setConfirmDialog({
        isOpen: true,
        message: '이 거래 내역을 정말 삭제하시겠습니까? 삭제 후에는 복구할 수 없습니다.',
        onConfirm: () => {
            setTransactions(prev => prev.filter(t => t.id !== id));
            showToast('내역이 삭제되었습니다.', 'info');
        }
    });
  };

  const handlePayBill = (bill: RecurringExpense) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = Math.min(bill.day, new Date(year, month + 1, 0).getDate());
    
    const targetDate = new Date(year, month, day);
    const offset = targetDate.getTimezoneOffset() * 60000;
    const dateStr = new Date(targetDate.getTime() - offset).toISOString().split('T')[0];

    handleAddTransaction({
      date: dateStr,
      amount: bill.amount,
      type: 'expense',
      category: bill.category || '기타',
      bank: '현금',
      description: bill.name
    });
    
    showToast(`'${bill.name}' 지출 처리가 완료되었습니다.`);
  };

  const handleAnalyze = async () => {
    const yearTransactions = transactions.filter(t => t.date && new Date(t.date).getFullYear() === currentDate.getFullYear());
    if (yearTransactions.length === 0) {
      showToast('분석할 데이터가 부족합니다.', 'error');
      return;
    }
    setIsAnalyzing(true);
    setShowAnalysis(true);
    const result = await analyzeFinancialData(yearTransactions, `${currentDate.getFullYear()}년 ${currentDate.getMonth() + 1}월`);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleExportData = () => {
    const data: BackupData = {
      transactions,
      recurringExpenses,
      investmentRecords,
      budgets,
      expenseCategories: expenseCats,
      incomeCategories: incomeCats,
      brokers
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    
    a.href = url;
    a.download = `moneyflow_backup_${today}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('백업 파일이 생성되었습니다.');
  };

  const handleImportData = (importedData: any) => {
    try {
      if (Array.isArray(importedData)) {
        setTransactions(importedData);
      } else if (importedData && typeof importedData === 'object') {
        if (Array.isArray(importedData.transactions)) setTransactions(importedData.transactions);
        if (importedData.recurringExpenses) setRecurringExpenses(importedData.recurringExpenses);
        if (importedData.investmentRecords) setInvestmentRecords(importedData.investmentRecords);
        if (importedData.budgets) setBudgets(importedData.budgets);
        if (Array.isArray(importedData.expenseCategories)) setExpenseCats(importedData.expenseCategories);
        if (Array.isArray(importedData.incomeCategories)) setIncomeCats(importedData.incomeCategories);
        if (Array.isArray(importedData.brokers)) setBrokers(importedData.brokers);
      } else {
        throw new Error("Invalid format");
      }
      showToast('데이터 복구가 완료되었습니다.');
    } catch (e) {
      showToast('올바른 백업 파일이 아닙니다.', 'error');
    }
  };

  const handleEmergencyRestore = () => {
    setConfirmDialog({
      isOpen: true,
      message: '현재 로컬 스토리지에 남아있는 모든 데이터를 다시 불러옵니다. 진행하시겠습니까?',
      onConfirm: () => {
        const savedT = localStorage.getItem('moneyflow_transactions');
        if (savedT) setTransactions(JSON.parse(savedT));
        showToast('로컬 데이터가 복원되었습니다.');
      }
    });
  };

  const startTour = () => {
    introJs().setOptions({
      steps: [
        {
          title: '환영합니다! 👋',
          intro: 'MoneyFlow AI와 함께 스마트한 자산 관리를 시작해보세요.'
        },
        {
          element: '#month-selector',
          intro: '여기서 조회하고 싶은 월을 선택할 수 있습니다.',
          position: 'bottom'
        },
        {
          element: '#stats-summary',
          intro: '이번 달의 총 수입, 지출, 그리고 현재 잔고를 한눈에 확인하세요.',
          position: 'bottom'
        },
        {
          element: '#ai-analyze-btn',
          intro: 'Gemini AI가 당신의 재정 상태를 심층 분석해 드립니다.',
          position: 'left'
        },
        {
          element: '#transaction-form-section',
          intro: '새로운 수입이나 지출이 생기면 여기서 바로 기록하세요.',
          position: 'top'
        },
        {
          element: '#transaction-list-section',
          intro: '기록된 모든 내역은 여기서 상세히 확인할 수 있습니다.',
          position: 'left'
        }
      ],
      showBullets: true,
      exitOnOverlayClick: false,
      nextLabel: '다음',
      prevLabel: '이전',
      doneLabel: '완료'
    }).start();
  };

  const handleStartApp = () => {
    setShowLanding(false);
    localStorage.setItem('moneyflow_onboarded', 'true');
    // Start tour after a short delay to ensure DOM is ready
    setTimeout(startTour, 500);
  };

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} onOpenLegal={setActiveLegalModal} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* Dynamic Header */}
      <header className="bg-indigo-900 text-white pt-8 pb-32 px-6 shadow-2xl relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/20 shadow-inner">
              <Wallet size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">MoneyFlow AI</h1>
              <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">
                {isPersistent ? 'PERSISTENT' : 'LOCAL'} STORAGE ACTIVE
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={() => setShowLanding(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all"><Home size={16} />처음으로</button>
            <button onClick={startTour} className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all"><HelpCircle size={16} />도움말</button>
            <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all"><History size={16} />기록 조회</button>
            <button onClick={() => setIsDataModalOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 transition-all"><Settings size={16} />백업/복구</button>
            <button id="ai-analyze-btn" onClick={handleAnalyze} className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 px-5 py-2 rounded-xl text-xs font-black shadow-lg shadow-indigo-500/30 transition-all active:scale-95">
              {isAnalyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} className="text-yellow-300" />}AI 분석
            </button>
          </div>
        </div>
        
        <div id="month-selector" className="max-w-7xl mx-auto mt-12 flex flex-col items-center justify-center">
           <div className="flex items-center gap-10 md:gap-20">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-3 hover:bg-white/10 rounded-full transition-all active:bg-white/20"><ChevronLeft size={40} /></button>
            <div className="text-center">
              <div className="text-indigo-300 text-sm font-bold mb-1 tracking-tighter">{currentDate.getFullYear()}</div>
              <h2 className="text-5xl font-black tracking-tight drop-shadow-lg">{currentDate.getMonth() + 1}월</h2>
            </div>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-3 hover:bg-white/10 rounded-full transition-all active:bg-white/20"><ChevronRight size={40} /></button>
          </div>
        </div>
      </header>

      {/* Content Main */}
      <main className="max-w-7xl mx-auto w-full px-6 -mt-24 pb-24 space-y-8 relative z-10">
        {/* Statistics Summary */}
        <div id="stats-summary" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-5 hover:translate-y-[-4px] transition-transform">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><TrendingUp size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">총 수입</p>
              <p className="text-2xl font-black text-gray-900">{stats.totalIncome.toLocaleString()}원</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-5 hover:translate-y-[-4px] transition-transform">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl"><TrendingDown size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">총 지출</p>
              <p className="text-2xl font-black text-gray-900">{stats.totalExpense.toLocaleString()}원</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 flex items-center gap-5 hover:translate-y-[-4px] transition-transform">
            <div className={`p-4 rounded-2xl ${stats.balance >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}><Wallet size={28} /></div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase mb-1">현재 잔고</p>
              <p className={`text-2xl font-black ${stats.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>{stats.balance.toLocaleString()}원</p>
            </div>
          </div>
        </div>

        {showAnalysis && (
          <Card className="border-indigo-100 ring-8 ring-indigo-50/50 shadow-2xl overflow-hidden" title="AI 재정 리포트">
            {isAnalyzing ? (
              <div className="py-20 text-center flex flex-col items-center gap-4 text-gray-500">
                <Loader2 className="animate-spin text-indigo-500" size={48} />
                <p className="font-bold">Gemini가 데이터를 심층 분석하고 있습니다...</p>
              </div>
            ) : <div className="prose prose-indigo max-w-none p-8 leading-relaxed whitespace-pre-line text-gray-700">{aiAnalysis}</div>}
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="xl:col-span-2 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardCharts currentMonthTransactions={filteredTransactions} />
                <YearlyChart transactions={transactions} year={currentDate.getFullYear()} />
                <div className="lg:col-span-2">
                  <InvestmentStatus 
                    records={investmentRecords} 
                    brokers={brokers}
                    onAddRecord={(r) => setInvestmentRecords(prev => [...prev, { ...r, id: Math.random().toString(36).substr(2, 9) }])} 
                    onDeleteRecord={(id) => setInvestmentRecords(prev => prev.filter(r => r.id !== id))} 
                    currentViewDate={currentDate} 
                  />
                </div>
            </div>
            <BudgetOverview categories={expenseCats} transactions={filteredTransactions} budgets={budgets} onUpdateBudgets={setBudgets} />
          </div>

          {/* Sidebar Column */}
          <div className="space-y-8">
             <UpcomingBills 
                expenses={recurringExpenses} 
                onAdd={(e) => setRecurringExpenses(prev => [...prev, { ...e, id: Math.random().toString(36).substr(2, 9) }])} 
                onUpdate={(u) => setRecurringExpenses(prev => prev.map(e => e.id === u.id ? u : e))} 
                onDelete={(id) => setRecurringExpenses(prev => prev.filter(e => e.id !== id))} 
                onPay={handlePayBill} 
                currentViewDate={currentDate} 
                transactions={transactions} 
                categories={expenseCats} 
             />

             <div id="transaction-form-section" className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className={`px-8 py-5 border-b border-gray-100 ${editingTransaction ? 'bg-indigo-50' : 'bg-gray-50/50'}`}>
                  <h3 className="font-black text-gray-800 tracking-tighter uppercase">{editingTransaction ? '거래 정보 수정' : '새 거래 기록'}</h3>
                </div>
                <div className="p-8">
                  <TransactionForm onAddTransaction={handleAddTransaction} onUpdateTransaction={handleUpdateTransaction} editingTransaction={editingTransaction} onCancelEdit={() => setEditingTransaction(null)} incomeCategories={incomeCats} expenseCategories={expenseCats} onOpenCategoryManager={() => setIsCategoryManagerOpen(true)} currentViewDate={currentDate} />
                </div>
             </div>

             <Card id="transaction-list-section" title="내역 상세 리스트" className="h-[600px] shadow-2xl border-indigo-50">
                <TransactionList 
                  transactions={transactions} 
                  currentViewDate={currentDate}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleEditTransaction}
                />
             </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-12 border-t border-gray-200 text-center text-gray-400 text-xs">
        <p>© 2026 MoneyFlow AI. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <button onClick={() => setActiveLegalModal('terms')} className="hover:text-indigo-600 transition-colors">이용약관</button>
          <button onClick={() => setActiveLegalModal('privacy')} className="hover:text-indigo-600 transition-colors">개인정보처리방침</button>
          <button onClick={() => setActiveLegalModal('contact')} className="hover:text-indigo-600 transition-colors">문의하기</button>
        </div>
      </footer>

      {/* Overlays */}
      <CategoryManager 
        isOpen={isCategoryManagerOpen} 
        onClose={() => setIsCategoryManagerOpen(false)} 
        incomeCategories={incomeCats} 
        expenseCategories={expenseCats} 
        brokers={brokers}
        onUpdateCategories={(type, newCats) => type === 'income' ? setIncomeCats(newCats) : setExpenseCats(newCats)} 
        onUpdateBrokers={setBrokers}
      />
      <DataManagement isOpen={isDataModalOpen} onClose={() => setIsDataModalOpen(false)} transactions={transactions} onImport={handleImportData} onEmergencyRestore={handleEmergencyRestore} onExport={handleExportData} />
      <MonthlyHistory isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} transactions={transactions} onSelectMonth={setCurrentDate} />
      <ConfirmDialog isOpen={confirmDialog.isOpen} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))} />
      <InstallGuide isOpen={isInstallGuideOpen} onClose={() => setIsInstallGuideOpen(false)} deferredPrompt={deferredPrompt} onInstall={() => deferredPrompt?.prompt()} />
      <LegalModals activeModal={activeLegalModal} onClose={() => setActiveLegalModal(null)} />
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;