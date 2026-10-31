import React, { useMemo, useState } from 'react';
import { ChevronRight, Plus, Check, Pencil } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar as RBar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Transaction, RecurringExpense, BudgetMap, TOTAL_BUDGET, iconFor } from './types';
import { Card, Empty, Bar, Button, Sheet, Field, MoneyInput, inputCls, Segmented } from './ui';
import { toss } from './toss';
import { won, shortWon, sum, byCategory, dateLabel, insights, billStatus, ddayLabel, daysIn, ym } from './lib';

const COLORS = ['#3182f6', '#ff8a3d', '#22c55e', '#a855f7', '#f04452', '#14b8a6', '#facc15', '#64748b', '#ec4899', '#0ea5e9', '#84cc16', '#94a3b8'];

// ---------- 공통: 거래 한 줄 ----------
export const TxRow: React.FC<{ t: Transaction; onClick: () => void }> = ({ t, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 py-3 text-left active:bg-bg rounded-2xl -mx-1 px-1">
    <span className="w-10 h-10 shrink-0 rounded-full bg-bg flex items-center justify-center text-[19px]">{iconFor(t.category)}</span>
    <span className="flex-1 min-w-0">
      <span className="block text-[15.5px] font-semibold truncate">{t.description || t.category}</span>
      <span className="block text-[13px] text-mute truncate">{t.category}{t.bank ? ` · ${t.bank}` : ''}{t.billId ? ' · 정기결제' : ''}</span>
    </span>
    <span className={`num text-[15.5px] font-bold ${t.type === 'income' ? 'text-plus' : 'text-ink'}`}>{t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString('ko-KR')}원</span>
  </button>
);

// ---------- 홈 ----------
export const Home: React.FC<{
  view: Date; txs: Transaction[]; monthTxs: Transaction[]; budgets: BudgetMap; bills: RecurringExpense[];
  onOpenTx: (t: Transaction) => void; onAdd: () => void; onPayBill: (b: RecurringExpense) => void; goTab: (t: Tab) => void;
}> = ({ view, txs, monthTxs, budgets, bills, onOpenTx, onAdd, onPayBill, goTab }) => {
  const spent = sum(monthTxs, 'expense'), income = sum(monthTxs, 'income');
  const total = budgets[TOTAL_BUDGET] || 0;
  const ins = useMemo(() => insights(txs, view, budgets, bills), [txs, view, budgets, bills]);
  const upcoming = useMemo(() => bills.map(b => ({ b, s: billStatus(b, view, txs) })).filter(x => !x.s.paid).sort((a, b) => a.s.dday - b.s.dday), [bills, view, txs]);
  const soon = upcoming.filter(x => x.s.dday >= 0 && x.s.dday <= 3);
  const recent = [...monthTxs].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, 5);
  const m = view.getMonth() + 1;

  return (
    <div className="space-y-3">
      <Card>
        <p className="text-[14px] text-sub font-medium">{m}월에 쓴 돈</p>
        <p className="num text-[32px] font-extrabold tracking-tight mt-0.5">{won(spent)}</p>
        <div className="flex gap-4 mt-2 text-[14px]">
          <span className="text-sub">수입 <b className="num text-plus font-semibold">{won(income)}</b></span>
          <span className="text-sub">남은 돈 <b className={`num font-semibold ${income - spent < 0 ? 'text-minus' : 'text-ink'}`}>{won(income - spent)}</b></span>
        </div>
        {total > 0 ? (
          <button onClick={() => goTab('budget')} className="w-full mt-4 text-left">
            <div className="flex justify-between text-[13px] mb-1.5">
              <span className="text-sub">예산 {won(total)} 중 <b className="text-ink">{Math.round((spent / total) * 100)}%</b> 사용</span>
              <span className={spent > total ? 'text-minus font-semibold' : 'text-sub'}>{spent > total ? `${won(spent - total)} 초과` : `${won(total - spent)} 남음`}</span>
            </div>
            <Bar ratio={spent / total} />
          </button>
        ) : (
          <button onClick={() => goTab('budget')} className="mt-4 w-full flex items-center justify-between bg-bg rounded-2xl px-4 py-3 text-[14px] font-semibold text-sub">
            이번 달 예산 정하기 <ChevronRight size={18} />
          </button>
        )}
      </Card>

      {soon.length > 0 && (
        <button onClick={() => goTab('bills')} className="w-full flex items-center gap-3 bg-[#fff4e6] rounded-3xl px-5 py-4 text-left">
          <span className="text-[22px]">🔔</span>
          <span className="flex-1 text-[15px] font-semibold text-[#b25a00]">
            {soon[0].s.dday === 0 ? '오늘' : `${soon[0].s.dday}일 뒤`} {soon[0].b.name} {won(soon[0].b.amount)} 결제 예정{soon.length > 1 ? ` 외 ${soon.length - 1}건` : ''}
          </span>
          <ChevronRight size={18} className="text-[#b25a00]" />
        </button>
      )}

      <Card title="지출 패턴 요약">
        {ins.length ? (
          <ul className="space-y-3.5">
            {ins.map((x, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-9 h-9 shrink-0 rounded-full bg-bg flex items-center justify-center text-[17px]">{x.icon}</span>
                <span className="flex-1">
                  <span className="block text-[13px] text-mute">{x.title}</span>
                  <span className={`block text-[15px] font-semibold ${x.tone === 'up' ? 'text-minus' : x.tone === 'down' ? 'text-brand' : 'text-ink'}`}>{x.text}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : <Empty icon="🧾" text={'지출을 기록하면\n이번 달 소비 패턴을 정리해 드려요.'} action={<Button variant="soft" onClick={onAdd}>첫 지출 기록하기</Button>} />}
        <p className="text-[12px] text-mute mt-4">기록한 내역만으로 기기 안에서 계산한 요약이에요.</p>
      </Card>

      {upcoming.length > 0 && (
        <Card title="이번 달 남은 정기결제" right={<button onClick={() => goTab('bills')} className="text-[14px] text-mute font-medium flex items-center">전체 <ChevronRight size={16} /></button>}>
          {upcoming.slice(0, 3).map(({ b, s }) => (
            <div key={b.id} className="flex items-center gap-3 py-2.5">
              <span className="w-10 h-10 shrink-0 rounded-full bg-bg flex items-center justify-center text-[19px]">{iconFor(b.category)}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15.5px] font-semibold truncate">{b.name}</span>
                <span className={`block text-[13px] ${s.dday < 0 ? 'text-minus' : 'text-mute'}`}>매달 {b.day}일 · {ddayLabel(s.dday)}</span>
              </span>
              <span className="num text-[15px] font-bold mr-1">{won(b.amount)}</span>
              <button onClick={() => onPayBill(b)} className="text-[13px] font-semibold bg-[#e8f3ff] text-brand rounded-xl px-3 py-2">기록</button>
            </div>
          ))}
        </Card>
      )}

      <Card title="최근 내역" right={recent.length > 0 && <button onClick={() => goTab('history')} className="text-[14px] text-mute font-medium flex items-center">전체 <ChevronRight size={16} /></button>}>
        {recent.length ? recent.map(t => <TxRow key={t.id} t={t} onClick={() => onOpenTx(t)} />) : <Empty icon="✍️" text="아직 이번 달 내역이 없어요." />}
      </Card>
    </div>
  );
};

// ---------- 내역 ----------
export const History: React.FC<{ monthTxs: Transaction[]; onOpenTx: (t: Transaction) => void; onAdd: () => void }> = ({ monthTxs, onOpenTx, onAdd }) => {
  const [filter, setFilter] = useState<'all' | 'expense' | 'income'>('all');
  const list = monthTxs.filter(t => filter === 'all' || t.type === filter).sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const groups = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    list.forEach(t => { const g = m.get(t.date) || []; g.push(t); m.set(t.date, g); });
    return [...m.entries()];
  }, [list]);
  return (
    <div className="space-y-3">
      <Card>
        <Segmented value={filter} onChange={setFilter} options={[{ value: 'all', label: '전체' }, { value: 'expense', label: '지출' }, { value: 'income', label: '수입' }]} />
        <div className="flex justify-between mt-4 text-[14px]">
          <span className="text-sub">지출 <b className="num text-ink">{won(sum(monthTxs, 'expense'))}</b></span>
          <span className="text-sub">수입 <b className="num text-plus">{won(sum(monthTxs, 'income'))}</b></span>
        </div>
      </Card>
      {groups.length ? groups.map(([d, ts]) => {
        const out = ts.reduce((a, t) => a + (t.type === 'expense' ? t.amount : 0), 0);
        return (
          <Card key={d}>
            <div className="flex justify-between text-[13.5px] mb-1">
              <span className="font-semibold text-sub">{dateLabel(d)}</span>
              {out > 0 && <span className="num text-mute">-{out.toLocaleString('ko-KR')}원</span>}
            </div>
            {ts.map(t => <TxRow key={t.id} t={t} onClick={() => onOpenTx(t)} />)}
          </Card>
        );
      }) : <Card><Empty icon="📭" text="이번 달 내역이 없어요." action={<Button variant="soft" onClick={onAdd}>내역 추가하기</Button>} /></Card>}
    </div>
  );
};

// ---------- 통계 ----------
export const Stats: React.FC<{ view: Date; txs: Transaction[]; monthTxs: Transaction[] }> = ({ view, txs, monthTxs }) => {
  const cats = byCategory(monthTxs, 'expense');
  const spent = sum(monthTxs, 'expense');
  const y = view.getFullYear(), m0 = view.getMonth();
  const daily = useMemo(() => {
    const arr = Array.from({ length: daysIn(y, m0) }, (_, i) => ({ d: i + 1, v: 0 }));
    monthTxs.forEach(t => { if (t.type === 'expense') arr[Number(t.date.slice(8, 10)) - 1].v += t.amount; });
    return arr;
  }, [monthTxs, y, m0]);
  const yearly = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const mt = txs.filter(t => t.date.startsWith(ym(new Date(y, i, 1))));
    return { m: `${i + 1}월`, 지출: sum(mt, 'expense'), 수입: sum(mt, 'income') };
  }), [txs, y]);
  const tip = { formatter: (v: any) => won(Number(v)), contentStyle: { borderRadius: 14, border: 'none', boxShadow: '0 4px 16px rgba(0,0,0,.12)', fontSize: 13 } };

  return (
    <div className="space-y-3">
      <Card title="분류별 지출">
        {cats.length ? (
          <>
            <div className="relative h-52">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={cats} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="92%" paddingAngle={2} stroke="none" isAnimationActive={false}>
                    {cats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[13px] text-mute">총 지출</span>
                <span className="num text-[20px] font-extrabold">{shortWon(spent)}원</span>
              </div>
            </div>
            <ul className="mt-3 space-y-2.5">
              {cats.map((c, i) => (
                <li key={c.name} className="flex items-center gap-2.5 text-[15px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="flex-1">{iconFor(c.name)} {c.name}</span>
                  <span className="text-mute text-[13px] w-10 text-right">{Math.round((c.value / spent) * 100)}%</span>
                  <span className="num font-semibold w-28 text-right">{won(c.value)}</span>
                </li>
              ))}
            </ul>
          </>
        ) : <Empty icon="📊" text="이번 달 지출이 없어요." />}
      </Card>
      <Card title="일별 지출">
        <div className="h-44 -mx-2">
          <ResponsiveContainer>
            <BarChart data={daily} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
              <XAxis dataKey="d" tickLine={false} axisLine={false} interval={4} tick={{ fontSize: 11, fill: '#8b95a1' }} />
              <Tooltip {...tip} labelFormatter={l => `${m0 + 1}월 ${l}일`} cursor={{ fill: '#f2f4f6' }} />
              <RBar dataKey="v" name="지출" fill="#3182f6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title={`${y}년 월별 흐름`}>
        <div className="h-52 -mx-2">
          <ResponsiveContainer>
            <BarChart data={yearly} margin={{ top: 4, right: 4, left: 4, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke="#f2f4f6" />
              <XAxis dataKey="m" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#8b95a1' }} tickFormatter={v => v.replace('월', '')} />
              <YAxis hide />
              <Tooltip {...tip} cursor={{ fill: '#f2f4f6' }} />
              <RBar dataKey="수입" fill="#93c5fd" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <RBar dataKey="지출" fill="#3182f6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 text-[12.5px] text-sub mt-1">
          <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-[#93c5fd]" />수입</span>
          <span className="flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-brand" />지출</span>
        </div>
      </Card>
    </div>
  );
};

// ---------- 예산 ----------
export const Budget: React.FC<{ monthTxs: Transaction[]; budgets: BudgetMap; setBudgets: (b: BudgetMap) => void; cats: string[] }> = ({ monthTxs, budgets, setBudgets, cats }) => {
  const [edit, setEdit] = useState<string | null>(null);
  const [val, setVal] = useState('');
  const spentBy = new Map(byCategory(monthTxs, 'expense').map(c => [c.name, c.value]));
  const spent = sum(monthTxs, 'expense');
  const total = budgets[TOTAL_BUDGET] || 0;
  const catTotal = cats.reduce((a, c) => a + (budgets[c] || 0), 0);
  const open = (k: string) => { setEdit(k); setVal(budgets[k] ? String(budgets[k]) : ''); };
  const save = () => {
    if (!edit) return;
    const n = Number(val) || 0; const next = { ...budgets };
    if (n > 0) next[edit] = n; else delete next[edit];
    setBudgets(next); setEdit(null);
    if (n > 0) toss.log('budget_set', { scope: edit === TOTAL_BUDGET ? 'total' : 'category' });
  };
  return (
    <div className="space-y-3">
      <Card title="이번 달 전체 예산" right={<button onClick={() => open(TOTAL_BUDGET)} className="text-[14px] font-semibold text-brand flex items-center gap-1"><Pencil size={14} />{total ? '수정' : '정하기'}</button>}>
        {total ? (
          <>
            <p className="num text-[26px] font-extrabold">{won(total)}</p>
            <div className="flex justify-between text-[13.5px] mt-3 mb-1.5">
              <span className="text-sub">{won(spent)} 사용 ({Math.round((spent / total) * 100)}%)</span>
              <span className={spent > total ? 'text-minus font-semibold' : 'text-sub'}>{spent > total ? `${won(spent - total)} 초과` : `${won(total - spent)} 남음`}</span>
            </div>
            <Bar ratio={spent / total} />
          </>
        ) : <p className="text-[15px] text-sub">한 달에 쓸 금액을 정해 두면 남은 예산과 하루 사용 가능 금액을 알려 드려요.</p>}
      </Card>
      <Card title="분류별 예산" right={catTotal > 0 && <span className="text-[13px] text-mute">합계 {won(catTotal)}</span>}>
        <ul className="divide-y divide-line/70">
          {cats.map(c => {
            const b = budgets[c] || 0, s = spentBy.get(c) || 0;
            return (
              <li key={c}>
                <button onClick={() => open(c)} className="w-full py-3 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[17px]">{iconFor(c)}</span>
                    <span className="flex-1 text-[15px] font-semibold">{c}</span>
                    <span className="num text-[14px] text-sub">{b ? <><b className={s > b ? 'text-minus' : 'text-ink'}>{won(s)}</b> / {won(b)}</> : s ? won(s) : <span className="text-mute">예산 없음</span>}</span>
                  </div>
                  {b > 0 && <Bar ratio={s / b} />}
                </button>
              </li>
            );
          })}
        </ul>
      </Card>
      <Sheet open={!!edit} onClose={() => setEdit(null)} title={edit === TOTAL_BUDGET ? '이번 달 전체 예산' : `${edit} 예산`}
        footer={<div className="flex gap-2">{edit && budgets[edit] ? <Button variant="ghost" onClick={() => { setVal(''); const n = { ...budgets }; delete n[edit]; setBudgets(n); setEdit(null); }}>없애기</Button> : null}<Button full onClick={save}>저장하기</Button></div>}>
        <Field label="한 달 예산" hint="매달 같은 금액이 적용돼요."><MoneyInput big value={val} onChange={setVal} autoFocus /></Field>
      </Sheet>
    </div>
  );
};

// ---------- 정기결제 ----------
export const Bills: React.FC<{
  view: Date; txs: Transaction[]; bills: RecurringExpense[]; cats: string[];
  onSave: (b: Omit<RecurringExpense, 'id'> & { id?: string }) => void; onDelete: (id: string) => void; onPay: (b: RecurringExpense) => void;
}> = ({ view, txs, bills, cats, onSave, onDelete, onPay }) => {
  const [editing, setEditing] = useState<RecurringExpense | 'new' | null>(null);
  const [name, setName] = useState(''); const [amount, setAmount] = useState(''); const [day, setDay] = useState('1'); const [cat, setCat] = useState('구독');
  const open = (b: RecurringExpense | 'new') => {
    setEditing(b);
    if (b === 'new') { setName(''); setAmount(''); setDay(String(new Date().getDate())); setCat(cats.includes('구독') ? '구독' : cats[0]); }
    else { setName(b.name); setAmount(String(b.amount)); setDay(String(b.day)); setCat(b.category); }
  };
  const rows = bills.map(b => ({ b, s: billStatus(b, view, txs) })).sort((a, b) => Number(a.s.paid) - Number(b.s.paid) || a.b.day - b.b.day);
  const total = bills.reduce((a, b) => a + b.amount, 0);
  const paidSum = rows.filter(r => r.s.paid).reduce((a, r) => a + r.b.amount, 0);
  const valid = name.trim() && Number(amount) > 0 && Number(day) >= 1 && Number(day) <= 31;
  return (
    <div className="space-y-3">
      <Card>
        <p className="text-[14px] text-sub font-medium">매달 나가는 돈</p>
        <p className="num text-[28px] font-extrabold">{won(total)}</p>
        {total > 0 && <><div className="flex justify-between text-[13.5px] mt-3 mb-1.5 text-sub"><span>{view.getMonth() + 1}월 기록 완료 {won(paidSum)}</span><span>{rows.filter(r => r.s.paid).length}/{rows.length}건</span></div><Bar ratio={paidSum / total} color="#22c55e" /></>}
      </Card>
      <Card title="정기결제" right={<button onClick={() => open('new')} className="text-[14px] font-semibold text-brand flex items-center gap-1"><Plus size={16} />추가</button>}>
        {rows.length ? rows.map(({ b, s }) => (
          <div key={b.id} className="flex items-center gap-3 py-2.5">
            <button onClick={() => open(b)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
              <span className="w-10 h-10 shrink-0 rounded-full bg-bg flex items-center justify-center text-[19px]">{iconFor(b.category)}</span>
              <span className="flex-1 min-w-0">
                <span className="block text-[15.5px] font-semibold truncate">{b.name}</span>
                <span className={`block text-[13px] ${!s.paid && s.dday < 0 ? 'text-minus' : 'text-mute'}`}>매달 {b.day}일 · {s.paid ? '기록 완료' : ddayLabel(s.dday)}</span>
              </span>
              <span className="num text-[15px] font-bold">{won(b.amount)}</span>
            </button>
            {s.paid
              ? <span className="w-[54px] flex justify-center text-[#22c55e]"><Check size={22} /></span>
              : <button onClick={() => onPay(b)} className="w-[54px] text-[13px] font-semibold bg-[#e8f3ff] text-brand rounded-xl py-2">기록</button>}
          </div>
        )) : <Empty icon="🔁" text={'월세, 통신비, 구독료처럼\n매달 나가는 돈을 등록해 보세요.'} action={<Button variant="soft" onClick={() => open('new')}>정기결제 추가하기</Button>} />}
        {rows.length > 0 && <p className="text-[12px] text-mute mt-3">결제일이 다가오면 홈 화면에서 알려 드려요. '기록'을 누르면 지출 내역에 바로 추가돼요.</p>}
      </Card>
      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing === 'new' ? '정기결제 추가' : '정기결제 수정'}
        footer={<div className="flex gap-2">
          {editing && editing !== 'new' && <Button variant="danger" className="px-5" onClick={() => { onDelete(editing.id); setEditing(null); }}>삭제</Button>}
          <Button full disabled={!valid} onClick={() => { onSave({ id: editing && editing !== 'new' ? editing.id : undefined, name: name.trim(), amount: Number(amount), day: Number(day), category: cat }); setEditing(null); }}>저장하기</Button>
        </div>}>
        <Field label="이름"><input value={name} onChange={e => setName(e.target.value.slice(0, 20))} placeholder="예: 월세, 통신비, 넷플릭스" className={inputCls} /></Field>
        <Field label="금액"><MoneyInput value={amount} onChange={setAmount} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="결제일 (매달)">
            <select value={day} onChange={e => setDay(e.target.value)} className={inputCls}>
              {Array.from({ length: 31 }, (_, i) => <option key={i} value={i + 1}>{i + 1}일</option>)}
            </select>
          </Field>
          <Field label="분류">
            <select value={cat} onChange={e => setCat(e.target.value)} className={inputCls}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
      </Sheet>
    </div>
  );
};

export type Tab = 'home' | 'history' | 'stats' | 'budget' | 'bills';
