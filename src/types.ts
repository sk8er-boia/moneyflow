export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  bank: string; // 결제수단 (예전 백업과 호환되도록 이름 유지)
  description: string;
  billId?: string; // 정기결제에서 기록한 경우
}

export interface BudgetMap {
  [category: string]: number; // TOTAL_BUDGET 키는 월 전체 예산
}

export interface RecurringExpense {
  id: string;
  name: string;
  amount: number;
  day: number; // 1~31
  category: string;
}

export interface BackupData {
  app?: string;
  version?: number;
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  budgets: BudgetMap;
  expenseCategories: string[];
  incomeCategories: string[];
}

export const TOTAL_BUDGET = '__total';

export const EXPENSE_CATEGORIES = [
  '식비', '카페·간식', '교통', '주거·통신', '생활용품', '쇼핑',
  '의료·건강', '문화·여가', '교육', '경조사·선물', '구독', '기타',
];

export const INCOME_CATEGORIES = ['급여', '부수입', '용돈', '금융수입', '기타'];

export const PAY_METHODS = ['카드', '현금', '계좌이체', '간편결제'];

const ICONS: Record<string, string> = {
  '식비': '🍚', '카페·간식': '☕', '교통': '🚌', '주거·통신': '🏠', '생활용품': '🧴', '쇼핑': '🛍️',
  '의료·건강': '💊', '문화·여가': '🎬', '교육': '📚', '경조사·선물': '🎁', '구독': '🔁', '기타': '📦',
  '급여': '💼', '부수입': '💡', '용돈': '🪙', '금융수입': '🏦',
};
export const iconFor = (cat: string) => ICONS[cat] || '🏷️';
