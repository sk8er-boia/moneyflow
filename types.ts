
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  date: string; // ISO String YYYY-MM-DD
  amount: number;
  type: TransactionType;
  category: string;
  bank: string; // 은행/계좌 정보
  description: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export interface BudgetMap {
  [category: string]: number;
}

export interface InvestmentRecord {
  id: string;
  date: string;
  broker: string; // '미래에셋' | '하나증권'
  amount: number;
}

export interface RecurringExpense {
  id: string;
  name: string; // 예: 넷플릭스, 월세
  amount: number;
  day: number; // 1~31
  category: string;
}

export interface BackupData {
  transactions: Transaction[];
  recurringExpenses: RecurringExpense[];
  investmentRecords: InvestmentRecord[];
  budgets: BudgetMap;
  expenseCategories: string[];
  incomeCategories: string[];
  brokers: string[];
}

export const DEFAULT_BROKERS = ['미래에셋', '하나증권'];

export const EXPENSE_CATEGORIES = [
  '투자',
  '대출',
  '신용카드',
  '보험',
  '운영자금-미래에셋',
  '운영자금-하나증권',
  '기타',
];

export const INCOME_CATEGORIES = [
  '급여',
  '용돈',
  '금융소득',
  '사업소득',
  '기타',
];

export const BANK_LIST = [
  '현금',
  '하나은행',
  '국민은행',
  '신한은행',
  '우리은행',
  '농협',
  '카카오뱅크',
  '토스뱅크',
  'K뱅크',
  '미래에셋',
  '한국투자증권',
  '삼성증권',
  '키움증권',
  '하나증권',
];
