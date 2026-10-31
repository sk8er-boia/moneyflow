import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Settings as Gear, Plus, Home as HomeIc, List, PieChart, Target, Repeat } from 'lucide-react';
import { Transaction, RecurringExpense, BudgetMap, BackupData, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from './types';
import { KEYS, usePersisted, uid, ym, ymd, monthTx, daysIn } from './lib';
import { Home, History, Stats, Budget, Bills, Tab } from './screens';
import { TxSheet } from './TxSheet';
import { SettingsSheet, CategoryEditor } from './Settings';
import { Toast, Confirm } from './ui';
import { toss } from './toss';

const TABS: { id: Tab; label: string; icon: React.FC<{ size?: number; strokeWidth?: number }> }[] = [
  { id: 'home', label: '홈', icon: HomeIc },
  { id: 'history', label: '내역', icon: List },
  { id: 'stats', label: '통계', icon: PieChart },
  { id: 'budget', label: '예산', icon: Target },
  { id: 'bills', label: '정기결제', icon: Repeat },
];

export default function App() {
  const [txs, setTxs] = usePersisted<Transaction[]>(KEYS.tx, []);
  const [bills, setBills] = usePersisted<RecurringExpense[]>(KEYS.bills, []);
  const [budgets, setBudgets] = usePersisted<BudgetMap>(KEYS.budgets, {});
  const [expCats, setExpCats] = usePersisted<string[]>(KEYS.exp, EXPENSE_CATEGORIES);
  const [incCats, setIncCats] = usePersisted<string[]>(KEYS.inc, INCOME_CATEGORIES);

  const [view, setView] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [tab, setTab] = useState<Tab>('home');
  const [txOpen, setTxOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [settings, setSettings] = useState(false);
  const [catEdit, setCatEdit] = useState(false);
  const [del, setDel] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const toast = useCallback((m: string) => { setToastMsg(m); window.clearTimeout((toast as any).t); (toast as any).t = window.setTimeout(() => setToastMsg(null), 2200); }, []);
  const monthTxs = useMemo(() => monthTx(txs, ym(view)), [txs, view]);
  const isThisMonth = ym(view) === ym(new Date());
  const defaultDate = isThisMonth ? ymd(new Date()) : ymd(new Date(view.getFullYear(), view.getMonth(), daysIn(view.getFullYear(), view.getMonth())));

  // 토스: 뒤로가기 → 열린 시트부터 닫기
  useEffect(() => toss.onBack(() => {
    if (del) setDel(null);
    else if (catEdit) setCatEdit(false);
    else if (txOpen) setTxOpen(false);
    else if (settings) setSettings(false);
    else if (tab !== 'home') setTab('home');
    else toss.close();
  }), [del, catEdit, txOpen, settings, tab]);
  useEffect(() => { toss.log('app_open'); }, []);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const openAdd = () => { setEditing(null); setTxOpen(true); };
  const openTx = (t: Transaction) => { setEditing(t); setTxOpen(true); };

  const saveTx = (t: Omit<Transaction, 'id'> & { id?: string }) => {
    if (t.id) { setTxs(p => p.map(x => (x.id === t.id ? { ...(t as Transaction) } : x))); toast('수정했어요'); }
    else {
      const first = txs.length === 0;
      setTxs(p => [...p, { ...t, id: uid() }]);
      toast(t.type === 'expense' ? '지출을 기록했어요' : '수입을 기록했어요');
      toss.haptic('success'); toss.log('tx_add', { type: t.type, first: first ? 1 : 0 });
      if (txs.length + 1 === 10) setTimeout(() => toss.review(), 1500);
      const [y, m] = t.date.split('-').map(Number);
      if (y !== view.getFullYear() || m - 1 !== view.getMonth()) setView(new Date(y, m - 1, 1));
    }
    setTxOpen(false);
  };
  const payBill = (b: RecurringExpense) => {
    const y = view.getFullYear(), m0 = view.getMonth();
    const date = ymd(new Date(y, m0, Math.min(b.day, daysIn(y, m0))));
    setTxs(p => [...p, { id: uid(), date, amount: b.amount, type: 'expense', category: b.category, bank: '', description: b.name, billId: b.id }]);
    toss.haptic('success'); toss.log('bill_pay');
    toast(`${b.name} 결제를 기록했어요`);
  };
  const saveBill = (b: Omit<RecurringExpense, 'id'> & { id?: string }) => {
    if (b.id) setBills(p => p.map(x => (x.id === b.id ? (b as RecurringExpense) : x)));
    else { setBills(p => [...p, { ...b, id: uid() }]); toss.log('bill_add'); }
    toast('저장했어요');
  };
  const exportData = async () => {
    const data: BackupData = { app: 'moneyflow', version: 2, transactions: txs, recurringExpenses: bills, budgets, expenseCategories: expCats, incomeCategories: incCats };
    const ok = await toss.saveFile(`머니플로우_백업_${ymd(new Date())}.json`, JSON.stringify(data, null, 2));
    toast(ok ? '백업 파일을 저장했어요' : '저장하지 못했어요');
  };
  const importData = (d: any) => {
    try {
      if (Array.isArray(d)) setTxs(d);
      else if (d && typeof d === 'object' && Array.isArray(d.transactions)) {
        setTxs(d.transactions);
        if (Array.isArray(d.recurringExpenses)) setBills(d.recurringExpenses);
        if (d.budgets && typeof d.budgets === 'object') setBudgets(d.budgets);
        if (Array.isArray(d.expenseCategories) && d.expenseCategories.length) setExpCats(d.expenseCategories);
        if (Array.isArray(d.incomeCategories) && d.incomeCategories.length) setIncCats(d.incomeCategories);
      } else throw new Error();
      toast('백업을 불러왔어요'); setSettings(false);
    } catch { toast('올바른 백업 파일이 아니에요'); }
  };
  const resetAll = () => { setTxs([]); setBills([]); setBudgets({}); setExpCats(EXPENSE_CATEGORIES); setIncCats(INCOME_CATEGORIES); setSettings(false); toast('모든 데이터를 지웠어요'); };

  const shift = (n: number) => setView(v => new Date(v.getFullYear(), v.getMonth() + n, 1));
  const title = TABS.find(t => t.id === tab)!.label;

  return (
    <div className="min-h-dvh max-w-md mx-auto bg-bg">
      <header className="sticky top-0 z-30 bg-bg/95 backdrop-blur px-5 pt-3 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center -ml-2">
            <button onClick={() => shift(-1)} aria-label="이전 달" className="p-2 rounded-full active:bg-line"><ChevronLeft size={22} /></button>
            <button onClick={() => setView(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); })} className="text-[20px] font-bold px-1">
              {view.getFullYear() !== new Date().getFullYear() && <span className="text-mute font-semibold mr-1">{view.getFullYear()}년</span>}{view.getMonth() + 1}월
            </button>
            <button onClick={() => shift(1)} aria-label="다음 달" className="p-2 rounded-full active:bg-line"><ChevronRight size={22} /></button>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[15px] font-semibold text-sub mr-1">{tab === 'home' ? '' : title}</span>
            <button onClick={() => setSettings(true)} aria-label="설정" className="p-2 -mr-2 rounded-full text-sub active:bg-line"><Gear size={22} /></button>
          </div>
        </div>
      </header>

      <main className="px-3 pb-36 pt-1">
        {tab === 'home' && <Home view={view} txs={txs} monthTxs={monthTxs} budgets={budgets} bills={bills} onOpenTx={openTx} onAdd={openAdd} onPayBill={payBill} goTab={setTab} />}
        {tab === 'history' && <History monthTxs={monthTxs} onOpenTx={openTx} onAdd={openAdd} />}
        {tab === 'stats' && <Stats view={view} txs={txs} monthTxs={monthTxs} />}
        {tab === 'budget' && <Budget monthTxs={monthTxs} budgets={budgets} setBudgets={setBudgets} cats={expCats} />}
        {tab === 'bills' && <Bills view={view} txs={txs} bills={bills} cats={expCats} onSave={saveBill} onDelete={id => setBills(p => p.filter(b => b.id !== id))} onPay={payBill} />}
      </main>

      {tab !== 'bills' && tab !== 'budget' && (
        <button onClick={openAdd} aria-label="내역 추가"
          className="fixed z-30 right-[max(20px,calc(50vw-224px+20px))] bottom-[88px] w-14 h-14 rounded-full bg-brand text-white shadow-[0_6px_20px_rgba(49,130,246,.45)] flex items-center justify-center active:scale-95 transition-transform">
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      <nav className="fixed z-30 bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-line safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 pt-2.5 pb-2 text-[11.5px] font-semibold ${tab === id ? 'text-ink' : 'text-[#b0b8c1]'}`}>
              <Icon size={23} strokeWidth={tab === id ? 2.4 : 2} />{label}
            </button>
          ))}
        </div>
      </nav>

      <TxSheet open={txOpen} onClose={() => setTxOpen(false)} editing={editing} defaultDate={defaultDate} expenseCats={expCats} incomeCats={incCats}
        onSave={saveTx} onDelete={id => setDel(id)} onManageCats={() => setCatEdit(true)} />
      <SettingsSheet open={settings} onClose={() => setSettings(false)} onEditCats={() => setCatEdit(true)} onExport={exportData} onImport={importData} onReset={resetAll} count={txs.length} />
      <CategoryEditor open={catEdit} onClose={() => setCatEdit(false)} expense={expCats} income={incCats} setExpense={setExpCats} setIncome={setIncCats} />
      <Confirm open={!!del} title="이 내역을 지울까요?" message="지운 내역은 되돌릴 수 없어요." onConfirm={() => { setTxs(p => p.filter(t => t.id !== del)); setTxOpen(false); toast('지웠어요'); }} onClose={() => setDel(null)} />
      <Toast msg={toastMsg} />
    </div>
  );
}
