// 토스 미니앱 안에서만 쓰는 기능을 모아 둔 곳이에요. 웹에서는 모두 조용히 아무 일도 하지 않아요.
import { Storage, graniteEvent, Analytics, Review, generateHapticFeedback, closeView, saveBase64Data } from '@apps-in-toss/web-framework';

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
// 토스 웹뷰 여부: 토스 빌드에서는 VITE_TOSS=1, 웹 빌드에서는 비어 있어요.
export const IN_TOSS = import.meta.env.MODE === 'toss' || /TossApp|AppsInToss/i.test(ua);

const safe = <T,>(fn: () => T): T | undefined => {
  try { const r: any = fn(); if (r && typeof r.catch === 'function') r.catch(() => {}); return r; } catch { return undefined; }
};
const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<undefined>(res => setTimeout(() => res(undefined), ms))]);

export const toss = {
  save(key: string, value: string) { if (IN_TOSS) safe(() => Storage.setItem(key, value)); },
  // 토스 저장소에 있는 값을 localStorage로 가져와요 (웹뷰 저장소가 지워졌을 때 복구)
  async restore(keys: string[]) {
    if (!IN_TOSS) return;
    await Promise.all(keys.map(async k => {
      try {
        const v = await withTimeout(Storage.getItem(k), 1500);
        if (typeof v === 'string' && localStorage.getItem(k) == null) localStorage.setItem(k, v);
      } catch { /* ignore */ }
    }));
  },
  onBack(fn: () => void) {
    if (!IN_TOSS) return () => {};
    const off = safe(() => graniteEvent.addEventListener('backEvent', { onEvent: fn, onError() {} }));
    return typeof off === 'function' ? off : () => {};
  },
  close() { safe(() => closeView()); },
  haptic(type: 'tap' | 'success' | 'tickWeak' = 'tickWeak') { if (IN_TOSS) safe(() => generateHapticFeedback({ type } as any)); },
  log(name: string, params: Record<string, string | number | boolean> = {}) {
    if (IN_TOSS) safe(() => Analytics.log({ log_name: name, log_type: 'event', params }));
  },
  // 파일 저장: 토스 안에서는 기기 저장 기능, 웹에서는 일반 다운로드
  async saveFile(fileName: string, text: string, mimeType = 'application/json') {
    if (IN_TOSS) {
      try {
        const b64 = btoa(unescape(encodeURIComponent(text)));
        await saveBase64Data({ data: b64, fileName, mimeType });
        return true;
      } catch { /* 아래 웹 방식으로 시도 */ }
    }
    try {
      const url = URL.createObjectURL(new Blob([text], { type: mimeType }));
      const a = document.createElement('a'); a.href = url; a.download = fileName; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch { return false; }
  },
  review() {
    if (!IN_TOSS) return;
    safe(() => (Review.request.isSupported && !Review.request.isSupported() ? undefined : Review.request()));
  },
};
