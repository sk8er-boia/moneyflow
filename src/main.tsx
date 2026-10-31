import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { KEYS } from './lib';
import { toss } from './toss';

// 예전 버전(MoneyFlow AI)의 분류를 쓰던 사람은 그대로 이어서 쓰도록 옮겨요.
try {
  for (const [oldK, newK] of [['moneyflow_expense_categories_v3', KEYS.exp], ['moneyflow_income_categories_v3', KEYS.inc]]) {
    const v = localStorage.getItem(oldK);
    if (v && localStorage.getItem(newK) == null) localStorage.setItem(newK, v);
  }
} catch { /* ignore */ }

// 토스 안에서는 토스 저장소에 백업해 둔 기록을 먼저 불러온 뒤 화면을 그려요.
toss.restore(Object.values(KEYS)).finally(() => {
  createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
});
