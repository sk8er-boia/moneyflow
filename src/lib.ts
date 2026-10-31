import { useEffect, useState } from 'react';
import { Transaction, RecurringExpense, BudgetMap, TOTAL_BUDGET } from './types';
import { toss } from './toss';

// ---------- 저장 ----------
export const KEYS = {
  tx: 'moneyflow_transactions',
  bills: 'moneyflow_recurring_bills',
  budgets: 'moneyflow_budgets',
  exp: 'moneyflow_expense_categories_v4',
  inc: 'moneyflow_income_categories_v4',
  meta: 'moneyflow_meta',
};

export function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    const p = JSON.parse(v);
    return p ?? fallback;
  } catch { return fallback; }
}

export function usePersisted<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  useEffect(() => {
    const s = JSON.stringify(value);
    try { localStorage.setItem(key, s); } catch { /* full */ }
    toss.save(key, s);
  }, [key, value]);
  return [value, setValue] as const;
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

// ---------- 날짜·숫자 ----------
export const won = (n: number) => `${Math.round(n).toLocaleString('ko-KR')}원`;
export const shortWon = (n: number) => {
  const a = Math.abs(n);
  if (a >= 1e8) return `${(n / 1e8).toFixed(a >= 1e9 ? 0 : 1)}억`;
  if (a >= 1e4) return `${Math.round(n / 1e4).toLocaleString('ko-KR')}만`;
  return n.toLocaleString('ko-KR');
};
export const pad = (n: number) => String(n).padStart(2, '0');
export const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const ym = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
export const daysIn = (y: number, m0: number) => new Date(y, m0 + 1, 0).getDate();
export const WEEK = ['일', '월', '화', '수', '목', '금', '토'];
export const dateLabel = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  const today = ymd(new Date());
  const yest = ymd(new Date(Date.now() - 864e5));
  if (s === today) return `오늘 · ${m}월 ${d}일`;
  if (s === yest) return `어제 · ${m}월 ${d}일`;
  return `${m}월 ${d}일 ${WEEK[dt.getDay()]}요일`;
};

export const monthTx = (txs: Transaction[], month: string) => txs.filter(t => t.date?.startsWith(month));
export const sum = (txs: Transaction[], type: 'income' | 'expense') =>
  txs.reduce((a, t) => (t.type === type ? a + t.amount : a), 0);
export const byCategory = (txs: Transaction[], type: 'income' | 'expense') => {
  const m = new Map<string, number>();
  txs.forEach(t => { if (t.type === type) m.set(t.category, (m.get(t.category) || 0) + t.amount); });
  return [...m.entries()].map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
};

// ---------- 정기결제 ----------
export function billStatus(bill: RecurringExpense, view: Date, txs: Transaction[]) {
  const y = view.getFullYear(), m0 = view.getMonth();
  const day = Math.min(bill.day, daysIn(y, m0));
  const due = new Date(y, m0, day);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dday = Math.round((due.getTime() - today.getTime()) / 864e5);
  const month = ym(view);
  const paid = txs.some(t => t.type === 'expense' && t.date.startsWith(month) && (t.billId ? t.billId === bill.id : t.description === bill.name));
  return { due, dueStr: ymd(due), dday, paid };
}
export const ddayLabel = (d: number) => (d === 0 ? '오늘' : d > 0 ? `D-${d}` : `${-d}일 지남`);

// ---------- 지출 패턴 요약 (기기 안에서 계산) ----------
export interface Insight { icon: string; title: string; text: string; tone?: 'up' | 'down' | 'neutral' }

export function insights(txs: Transaction[], view: Date, budgets: BudgetMap, bills: RecurringExpense[]): Insight[] {
  const out: Insight[] = [];
  const y = view.getFullYear(), m0 = view.getMonth();
  const now = new Date();
  const isCurrent = now.getFullYear() === y && now.getMonth() === m0;
  const dim = daysIn(y, m0);
  const elapsed = isCurrent ? now.getDate() : dim;
  const cur = monthTx(txs, ym(view));
  const spent = sum(cur, 'expense');
  if (!cur.some(t => t.type === 'expense')) return out;

  // 1) 지난달 같은 기간 대비
  const prev = new Date(y, m0 - 1, 1);
  const prevCut = Math.min(elapsed, daysIn(prev.getFullYear(), prev.getMonth()));
  const prevSpent = monthTx(txs, ym(prev)).filter(t => t.type === 'expense' && Number(t.date.slice(8, 10)) <= prevCut).reduce((a, t) => a + t.amount, 0);
  if (prevSpent > 0) {
    const diff = spent - prevSpent, pct = Math.round((diff / prevSpent) * 100);
    out.push({
      icon: diff > 0 ? '📈' : '📉',
      title: isCurrent ? '지난달 이맘때보다' : '지난달보다',
      text: diff === 0 ? '지출이 같아요.' : `${won(Math.abs(diff))} ${diff > 0 ? '더' : '덜'} 썼어요 (${diff > 0 ? '+' : ''}${pct}%).`,
      tone: diff > 0 ? 'up' : 'down',
    });
  }
  // 2) 가장 많이 쓴 분야
  const cats = byCategory(cur, 'expense');
  if (cats.length) {
    const top = cats[0], share = Math.round((top.value / spent) * 100);
    out.push({ icon: '🏷️', title: '가장 많이 쓴 곳', text: `${top.name}에 ${won(top.value)}, 전체 지출의 ${share}%예요.` });
  }
  // 3) 하루 평균
  out.push({ icon: '📅', title: '하루 평균 지출', text: `${won(spent / Math.max(1, elapsed))}씩 썼어요.` });
  // 4) 요일 패턴 (기록이 충분할 때만)
  const exp = cur.filter(t => t.type === 'expense');
  if (exp.length >= 6) {
    const wk = new Array(7).fill(0);
    exp.forEach(t => { const [yy, mm, dd] = t.date.split('-').map(Number); wk[new Date(yy, mm - 1, dd).getDay()] += t.amount; });
    const maxI = wk.indexOf(Math.max(...wk));
    out.push({ icon: '🗓️', title: '지출이 많은 요일', text: `${WEEK[maxI]}요일에 가장 많이 썼어요 (${won(wk[maxI])}).` });
  }
  // 5) 고정지출 비중
  const fixed = bills.reduce((a, b) => a + b.amount, 0);
  if (fixed > 0) {
    out.push({ icon: '🔁', title: '매달 나가는 정기결제', text: `${bills.length}건, 합쳐서 ${won(fixed)}예요.` });
  }
  // 6) 예산 페이스
  const total = budgets[TOTAL_BUDGET] || 0;
  if (total > 0 && isCurrent) {
    const left = total - spent, daysLeft = dim - elapsed + 1;
    out.push(left >= 0
      ? { icon: '🎯', title: '남은 예산', text: `${won(left)} 남았어요. 하루 ${won(left / daysLeft)}씩 쓰면 예산 안이에요.`, tone: 'down' }
      : { icon: '⚠️', title: '예산 초과', text: `이번 달 예산보다 ${won(-left)} 더 썼어요.`, tone: 'up' });
  }
  return out;
}
