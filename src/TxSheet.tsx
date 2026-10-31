import React, { useEffect, useState } from 'react';
import { Transaction, TransactionType, PAY_METHODS, iconFor } from './types';
import { Sheet, Segmented, Field, MoneyInput, Button, inputCls } from './ui';
import { ymd } from './lib';

interface Props {
  open: boolean;
  onClose: () => void;
  editing: Transaction | null;
  defaultDate: string;
  expenseCats: string[];
  incomeCats: string[];
  onSave: (t: Omit<Transaction, 'id'> & { id?: string }) => void;
  onDelete: (id: string) => void;
  onManageCats: () => void;
}

export const TxSheet: React.FC<Props> = ({ open, onClose, editing, defaultDate, expenseCats, incomeCats, onSave, onDelete, onManageCats }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(defaultDate);
  const [method, setMethod] = useState('');
  const [memo, setMemo] = useState('');

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setType(editing.type); setAmount(String(editing.amount)); setCategory(editing.category);
      setDate(editing.date); setMethod(editing.bank || ''); setMemo(editing.description || '');
    } else {
      setType('expense'); setAmount(''); setCategory(''); setDate(defaultDate); setMethod(''); setMemo('');
    }
  }, [open, editing, defaultDate]);

  const cats = type === 'expense' ? expenseCats : incomeCats;
  useEffect(() => { if (open && !cats.includes(category)) setCategory(''); }, [type]); // eslint-disable-line

  const valid = Number(amount) > 0 && !!category && !!date;
  const save = () => {
    if (!valid) return;
    onSave({ id: editing?.id, type, amount: Number(amount), category, date, bank: method, description: memo.trim(), billId: editing?.billId });
  };

  return (
    <Sheet open={open} onClose={onClose} title={editing ? '내역 수정' : '내역 추가'}
      footer={
        <div className="flex gap-2">
          {editing && <Button variant="danger" onClick={() => onDelete(editing.id)} className="px-5">삭제</Button>}
          <Button full disabled={!valid} onClick={save}>{editing ? '수정하기' : '저장하기'}</Button>
        </div>
      }>
      <div className="mb-4">
        <Segmented value={type} onChange={setType} options={[{ value: 'expense', label: '지출' }, { value: 'income', label: '수입' }]} />
      </div>
      <Field label="금액"><MoneyInput big value={amount} onChange={setAmount} autoFocus={!editing} /></Field>
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[13px] font-semibold text-sub">분류</span>
          <button type="button" onClick={onManageCats} className="text-[13px] font-semibold text-brand">분류 편집</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {cats.map(c => (
            <button key={c} type="button" onClick={() => setCategory(c)}
              className={`flex flex-col items-center gap-1 rounded-2xl py-2.5 px-1 text-[12.5px] font-medium transition-colors ${category === c ? (type === 'expense' ? 'bg-[#e8f3ff] text-brand ring-2 ring-brand' : 'bg-[#e8f3ff] text-brand ring-2 ring-brand') : 'bg-bg text-sub'}`}>
              <span className="text-[20px] leading-none">{iconFor(c)}</span>
              <span className="leading-tight text-center break-keep">{c}</span>
            </button>
          ))}
        </div>
      </div>
      <Field label="날짜">
        <input type="date" value={date} max={ymd(new Date(Date.now() + 365 * 864e5))} onChange={e => setDate(e.target.value)} className={inputCls} />
      </Field>
      <Field label="메모 (선택)">
        <input value={memo} onChange={e => setMemo(e.target.value.slice(0, 40))} placeholder={type === 'expense' ? '예: 점심, 마트 장보기' : '예: 10월 월급'} className={inputCls} />
      </Field>
      {type === 'expense' && (
        <div className="mb-2">
          <span className="block text-[13px] font-semibold text-sub mb-1.5">결제수단 (선택)</span>
          <div className="flex flex-wrap gap-2">
            {PAY_METHODS.map(m => (
              <button key={m} type="button" onClick={() => setMethod(method === m ? '' : m)}
                className={`px-3.5 py-2 rounded-full text-[14px] font-medium ${method === m ? 'bg-ink text-white' : 'bg-bg text-sub'}`}>{m}</button>
            ))}
          </div>
        </div>
      )}
    </Sheet>
  );
};
