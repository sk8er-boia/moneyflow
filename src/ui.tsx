import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Card: React.FC<{ title?: React.ReactNode; right?: React.ReactNode; className?: string; children: React.ReactNode; id?: string }> =
  ({ title, right, className = '', children, id }) => (
    <section id={id} className={`bg-white rounded-3xl px-5 py-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[17px] font-bold text-ink">{title}</h2>
          {right}
        </div>
      )}
      {children}
    </section>
  );

export const Sheet: React.FC<{ open: boolean; onClose: () => void; title?: string; children: React.ReactNode; footer?: React.ReactNode }> =
  ({ open, onClose, title, children, footer }) => {
    useEffect(() => {
      if (!open) return;
      const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }, [open]);
    if (!open) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 fade-enter" onClick={onClose} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sheet-enter w-full max-w-md bg-white rounded-t-[28px] max-h-[92vh] flex flex-col safe-bottom" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <h3 className="text-[19px] font-bold">{title}</h3>
            <button onClick={onClose} aria-label="닫기" className="p-2 -mr-2 rounded-full text-mute hover:bg-bg"><X size={22} /></button>
          </div>
          <div className="px-5 pb-4 overflow-y-auto no-scrollbar">{children}</div>
          {footer && <div className="px-5 pt-2 pb-5 border-t border-line/60">{footer}</div>}
        </div>
      </div>
    );
  };

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'soft' | 'danger' | 'ghost'; full?: boolean }> =
  ({ variant = 'primary', full, className = '', ...p }) => {
    const v = {
      primary: 'bg-brand text-white active:bg-brand-dark disabled:bg-brand/40',
      soft: 'bg-[#e8f3ff] text-brand active:bg-[#d4e8ff]',
      danger: 'bg-[#ffeeee] text-minus active:bg-[#ffdede]',
      ghost: 'bg-bg text-sub active:bg-line',
    }[variant];
    return <button {...p} className={`${v} ${full ? 'w-full' : ''} rounded-2xl px-4 py-3.5 text-[16px] font-semibold transition-colors ${className}`} />;
  };

export const Segmented = <T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) => (
  <div className="flex bg-bg rounded-2xl p-1" role="tablist">
    {options.map(o => (
      <button key={o.value} role="tab" aria-selected={value === o.value} onClick={() => onChange(o.value)}
        className={`flex-1 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${value === o.value ? 'bg-white shadow-sm text-ink' : 'text-mute'}`}>
        {o.label}
      </button>
    ))}
  </div>
);

export const Field: React.FC<{ label: string; children: React.ReactNode; hint?: string }> = ({ label, children, hint }) => (
  <label className="block mb-4">
    <span className="block text-[13px] font-semibold text-sub mb-1.5">{label}</span>
    {children}
    {hint && <span className="block text-[12px] text-mute mt-1">{hint}</span>}
  </label>
);

export const inputCls = 'w-full bg-bg rounded-2xl px-4 py-3.5 text-[16px] outline-none focus:ring-2 focus:ring-brand/40 placeholder:text-mute';

export const MoneyInput: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean; big?: boolean }> =
  ({ value, onChange, placeholder = '0', autoFocus, big }) => (
    <div className={`flex items-baseline gap-1 bg-bg rounded-2xl px-4 ${big ? 'py-4' : 'py-3.5'}`}>
      <input inputMode="numeric" autoFocus={autoFocus} value={value ? Number(value).toLocaleString('ko-KR') : ''} placeholder={placeholder}
        onChange={e => onChange(e.target.value.replace(/[^0-9]/g, '').slice(0, 12))}
        className={`num flex-1 min-w-0 bg-transparent outline-none ${big ? 'text-[28px] font-bold' : 'text-[16px]'} placeholder:text-mute`} />
      <span className={`${big ? 'text-[20px] font-bold' : 'text-[16px]'} text-sub`}>원</span>
    </div>
  );

export const Toast: React.FC<{ msg: string | null }> = ({ msg }) =>
  msg ? (
    <div className="fixed left-1/2 -translate-x-1/2 bottom-[96px] z-[60] bg-ink/90 text-white text-[14px] font-medium px-5 py-3 rounded-full shadow-lg fade-enter whitespace-nowrap" role="status">
      {msg}
    </div>
  ) : null;

export const Confirm: React.FC<{ open: boolean; title: string; message?: string; confirmLabel?: string; onConfirm: () => void; onClose: () => void }> =
  ({ open, title, message, confirmLabel = '삭제', onConfirm, onClose }) =>
    open ? (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-6 fade-enter" onClick={onClose}>
        <div className="w-full max-w-xs bg-white rounded-3xl p-6" onClick={e => e.stopPropagation()} role="alertdialog">
          <h3 className="text-[18px] font-bold mb-1">{title}</h3>
          {message && <p className="text-[15px] text-sub mb-5 whitespace-pre-line">{message}</p>}
          <div className="flex gap-2 mt-4">
            <Button variant="ghost" full onClick={onClose}>취소</Button>
            <Button variant={confirmLabel === '삭제' ? 'danger' : 'primary'} full onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
          </div>
        </div>
      </div>
    ) : null;

export const Empty: React.FC<{ icon: string; text: string; action?: React.ReactNode }> = ({ icon, text, action }) => (
  <div className="text-center py-8">
    <div className="text-[40px] mb-2">{icon}</div>
    <p className="text-[15px] text-mute whitespace-pre-line">{text}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const Bar: React.FC<{ ratio: number; color?: string }> = ({ ratio, color }) => (
  <div className="h-2.5 bg-bg rounded-full overflow-hidden">
    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, ratio * 100))}%`, background: color || (ratio > 1 ? 'var(--color-minus)' : ratio > 0.85 ? '#ff9f43' : 'var(--color-brand)') }} />
  </div>
);
