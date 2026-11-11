import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, ChevronDown, X, Plus } from 'lucide-react';
import { Sheet, Segmented, Button, inputCls, Confirm } from './ui';
import { iconFor } from './types';

export const CategoryEditor: React.FC<{
  open: boolean; onClose: () => void; expense: string[]; income: string[];
  setExpense: (c: string[]) => void; setIncome: (c: string[]) => void;
}> = ({ open, onClose, expense, income, setExpense, setIncome }) => {
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [name, setName] = useState('');
  const list = tab === 'expense' ? expense : income, set = tab === 'expense' ? setExpense : setIncome;
  const add = () => { const n = name.trim().slice(0, 10); if (n && !list.includes(n)) set([...list, n]); setName(''); };
  return (
    <Sheet open={open} onClose={onClose} title="분류 편집">
      <Segmented value={tab} onChange={setTab} options={[{ value: 'expense', label: '지출 분류' }, { value: 'income', label: '수입 분류' }]} />
      <div className="flex gap-2 mt-4">
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()} placeholder="새 분류 이름" className={inputCls} />
        <Button onClick={add} disabled={!name.trim()} className="px-4"><Plus size={20} /></Button>
      </div>
      <ul className="mt-3 divide-y divide-line/70">
        {list.map(c => (
          <li key={c} className="flex items-center gap-3 py-3">
            <span className="text-[18px]">{iconFor(c)}</span>
            <span className="flex-1 text-[15.5px]">{c}</span>
            <button disabled={list.length <= 1} onClick={() => set(list.filter(x => x !== c))} aria-label={`${c} 삭제`} className="p-2 text-mute disabled:opacity-30"><X size={18} /></button>
          </li>
        ))}
      </ul>
      <p className="text-[12px] text-mute mt-2 mb-2">분류를 지워도 이미 기록한 내역은 그대로 남아요.</p>
    </Sheet>
  );
};

type Doc = 'terms' | 'privacy' | 'contact' | 'oss' | null;
export const CONTACT_EMAIL = 'mash_mellow@naver.com';
export const COPYRIGHT = '© 2026 루시. All rights reserved.';

// 빌드할 때 만든 licenses.json(실제로 앱에 들어간 오픈소스 목록)을 보여 줘요.
type Lic = { name: string; version: string; license: string; text: string };
const Licenses: React.FC = () => {
  const [list, setList] = useState<Lic[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => { fetch('./licenses.json').then(r => r.json()).then(setList).catch(() => setList([])); }, []);
  return (
    <>
      <p>머니플로우 가계부는 아래 오픈소스 소프트웨어를 사용해요. 항목을 누르면 라이선스 전문을 볼 수 있어요.</p>
      <div>
        {list === null ? <p className="text-center text-mute py-6">불러오는 중…</p>
          : !list.length ? <p className="text-center text-mute py-6">목록을 불러오지 못했어요.</p>
          : list.map(l => {
            const id = `${l.name}@${l.version}`, on = open === id;
            return (
              <div key={id} className="border-b border-line/70 last:border-0">
                <button onClick={() => setOpen(on ? null : id)} aria-expanded={on} className="w-full flex items-center gap-2 py-3 text-left">
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-semibold text-ink truncate">{l.name}</span>
                    <span className="block text-[12.5px] text-mute">{l.version} · {l.license}</span>
                  </span>
                  <ChevronDown size={18} className={`text-mute transition-transform ${on ? 'rotate-180' : ''}`} />
                </button>
                {on && <pre className="mb-3 p-3 bg-bg rounded-2xl text-[11.5px] leading-relaxed whitespace-pre-wrap break-words">{l.text || `${l.license} License`}</pre>}
              </div>
            );
          })}
      </div>
    </>
  );
};

export const SettingsSheet: React.FC<{
  open: boolean; onClose: () => void; onEditCats: () => void; onExport: () => void; onImport: (data: unknown) => void; onReset: () => void; count: number;
}> = ({ open, onClose, onEditCats, onExport, onImport, onReset, count }) => {
  const [doc, setDoc] = useState<Doc>(null);
  const [confirm, setConfirm] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const Row: React.FC<{ label: string; sub?: string; onClick: () => void; danger?: boolean }> = ({ label, sub, onClick, danger }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between py-3.5 text-left">
      <span><span className={`block text-[16px] font-medium ${danger ? 'text-minus' : ''}`}>{label}</span>{sub && <span className="block text-[13px] text-mute">{sub}</span>}</span>
      <ChevronRight size={18} className="text-mute" />
    </button>
  );
  return (
    <>
      <Sheet open={open && !doc} onClose={onClose} title="설정">
        <h4 className="text-[13px] font-semibold text-mute mt-1">기록</h4>
        <Row label="분류 편집" sub="지출·수입 분류를 추가하거나 지워요" onClick={onEditCats} />
        <h4 className="text-[13px] font-semibold text-mute mt-3">데이터</h4>
        <Row label="백업 파일 저장" sub={`내역 ${count}건을 파일로 저장해요`} onClick={onExport} />
        <Row label="백업 파일 불러오기" sub="저장해 둔 파일로 복원해요" onClick={() => file.current?.click()} />
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={async e => {
          const f = e.target.files?.[0]; e.target.value = '';
          if (!f) return;
          try { onImport(JSON.parse(await f.text())); } catch { onImport(null); }
        }} />
        <Row label="모든 데이터 지우기" danger onClick={() => setConfirm(true)} />
        <h4 className="text-[13px] font-semibold text-mute mt-3">정보</h4>
        <Row label="이용약관" onClick={() => setDoc('terms')} />
        <Row label="개인정보 처리방침" onClick={() => setDoc('privacy')} />
        <Row label="문의하기" onClick={() => setDoc('contact')} />
        <Row label="오픈소스 라이선스" onClick={() => setDoc('oss')} />
        <p className="text-[12px] text-mute text-center mt-4">머니플로우 가계부 v1.0 · 모든 기록은 이 기기에만 저장돼요</p>
        <p className="text-[12px] text-mute text-center mt-1 mb-2">{COPYRIGHT}</p>
      </Sheet>
      <Sheet open={open && !!doc} onClose={() => setDoc(null)} title={doc === 'terms' ? '이용약관' : doc === 'privacy' ? '개인정보 처리방침' : doc === 'oss' ? '오픈소스 라이선스' : '문의하기'}>
        <div className="text-[14.5px] text-sub leading-relaxed space-y-4 pb-4">
          {doc === 'terms' && <>
            <p><b className="text-ink">제1조 (목적)</b><br />이 약관은 머니플로우 가계부(이하 "서비스")의 이용 조건과 절차를 정해요.</p>
            <p><b className="text-ink">제2조 (서비스 내용)</b><br />서비스는 이용자가 직접 입력한 수입·지출을 기록하고, 예산·차트·정기결제 알림과 지출 패턴 요약을 제공하는 가계부 도구예요. 금융 상품의 추천·중개·자문은 하지 않아요.</p>
            <p><b className="text-ink">제3조 (데이터 보관)</b><br />기록은 이용자의 기기 안에만 저장되고 서버로 전송되지 않아요. 앱 삭제나 기기 변경 시 기록이 사라질 수 있으니 '백업 파일 저장'을 이용해 주세요.</p>
            <p><b className="text-ink">제4조 (책임의 한계)</b><br />통계와 요약은 이용자가 입력한 내용을 바탕으로 계산한 참고 정보예요. 실제 금융 결정은 이용자 본인의 판단으로 해 주세요.</p>
          </>}
          {doc === 'privacy' && <>
            <p><b className="text-ink">1. 수집하는 정보</b><br />회원가입이 없고, 이름·연락처·계좌 같은 개인정보를 수집하지 않아요.</p>
            <p><b className="text-ink">2. 기록의 저장 위치</b><br />입력한 수입·지출, 예산, 정기결제 정보는 이용자의 기기(토스 앱 저장 공간 또는 브라우저 저장소)에만 저장돼요. 운영자 서버로 전송하지 않아요.</p>
            <p><b className="text-ink">3. 이용 통계</b><br />토스 앱 안에서는 서비스 개선을 위해 화면 이용 기록(예: 내역 추가 횟수)이 금액·메모 없이 익명으로 토스에 전달될 수 있어요.</p>
            <p><b className="text-ink">4. 삭제</b><br />설정의 '모든 데이터 지우기'로 언제든 모든 기록을 지울 수 있어요.</p>
            <p><b className="text-ink">5. 문의</b><br />{CONTACT_EMAIL}</p>
          </>}
          {doc === 'oss' && <Licenses />}
          {doc === 'contact' && <>
            <p>이용 중 불편한 점이나 바라는 기능이 있다면 메일로 알려 주세요.</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="block text-center bg-bg rounded-2xl py-4 text-[16px] font-semibold text-brand">{CONTACT_EMAIL}</a>
          </>}
        </div>
      </Sheet>
      <Confirm open={confirm} title="모든 데이터를 지울까요?" message={'내역, 예산, 정기결제가 모두 지워지고\n되돌릴 수 없어요.'} onConfirm={onReset} onClose={() => setConfirm(false)} />
    </>
  );
};
