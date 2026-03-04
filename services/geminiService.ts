
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction } from "../types";

// Helper to group transactions by month
const getMonthlySummary = (transactions: Transaction[], year: number) => {
  const summary = new Map<number, { income: number; expense: number; topCategory: string }>();

  for (let i = 1; i <= 12; i++) {
    summary.set(i, { income: 0, expense: 0, topCategory: '' });
  }

  transactions.forEach(t => {
    const d = new Date(t.date);
    if (d.getFullYear() === year) {
      const month = d.getMonth() + 1;
      const current = summary.get(month)!;
      if (t.type === 'income') current.income += t.amount;
      else current.expense += t.amount;
      summary.set(month, current);
    }
  });

  // Convert to string for prompt
  let summaryText = "";
  let yearlyIncome = 0;
  let yearlyExpense = 0;
  const monthlyData: any[] = [];

  Array.from(summary.entries()).forEach(([month, data]) => {
    if (data.income > 0 || data.expense > 0) {
      summaryText += `- ${month}월: 수입 ${data.income.toLocaleString()}원 / 지출 ${data.expense.toLocaleString()}원\n`;
      yearlyIncome += data.income;
      yearlyExpense += data.expense;
      monthlyData.push({ month, ...data });
    }
  });

  return { summaryText, yearlyIncome, yearlyExpense, monthlyData };
};

export const analyzeFinancialData = async (
  transactions: Transaction[],
  currentDateStr: string,
  userApiKey?: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: userApiKey || process.env.API_KEY });
  const year = parseInt(currentDateStr.split('년')[0]);
  const month = parseInt(currentDateStr.split('년')[1].replace('월', '').trim());

  if (transactions.length === 0) {
    return "분석할 데이터가 없습니다. 데이터를 먼저 입력해주세요.";
  }
  
  const { summaryText, yearlyIncome, yearlyExpense } = getMonthlySummary(transactions, year);

  const prompt = `
    당신은 전문 개인 자산 관리사(PB)입니다.
    사용자의 ${year}년 1월부터 현재까지의 재정 흐름을 분석하여 종합 리포트를 작성해주세요.

    [${year}년 연간 월별 흐름]
    ${summaryText}
    
    [연간 누적 현황]
    - 총 수입: ${yearlyIncome.toLocaleString()}원
    - 총 지출: ${yearlyExpense.toLocaleString()}원
    - 순수익: ${(yearlyIncome - yearlyExpense).toLocaleString()}원

    위 데이터를 바탕으로 다음 내용을 포함한 마크다운 리포트를 작성하세요.
    (분석 기준일: ${year}년 ${month}월)

    ### 1. 📊 연간 재정 추세 (Trend Analysis)
    - 올해 소득과 지출이 어떻게 변화하고 있는지 패턴을 분석하세요.
    - 지출이 급증했거나 소득이 불안정한 시기가 있었다면 원인을 추정하고 조언하세요.
    - 자산이 순조롭게 증가하고 있는지 평가하세요.

    ### 2. 💡 개선 포인트 및 전략
    - 현재 추세를 볼 때, 연말 목표 달성을 위해 어떤 부분(지출 통제, 투자 확대 등)에 집중해야 할지 구체적으로 제안하세요.
    - 고정비나 변동비 관리에 대한 조언을 포함하세요.

    ### 3. 🎯 향후 행동 지침
    - 남은 기간 동안 실천해야 할 구체적인 행동 가이드 3가지를 제시하세요.

    어조는 신뢰감 있고 전문적이며, 긍정적인 동기 부여를 주는 톤으로 작성해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "분석 결과를 생성하지 못했습니다.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "AI 분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

export interface PredictionResult {
  predictedAmount: number;
  reasoning: string;
}

export const predictNextMonthExpenses = async (
  transactions: Transaction[],
  userApiKey?: string
): Promise<PredictionResult> => {
  const ai = new GoogleGenAI({ apiKey: userApiKey || process.env.API_KEY });
  if (transactions.length === 0) {
    throw new Error("데이터가 부족합니다.");
  }

  const expenses = transactions
    .filter(t => t.type === 'expense')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const recentExpenses = expenses.slice(-100).map(t => 
    `${t.date}: ${t.amount}원 [${t.category}] ${t.description || ''}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        다음은 사용자의 과거 지출 내역입니다.
        데이터를 바탕으로 **다음 달 예상 총 지출액**을 예측하세요.

        [지출 내역]
        ${recentExpenses}

        분석 시 고려사항:
        1. 고정비와 변동비 추세를 반영하세요.
        2. 최근 3개월의 평균과 증가세를 중요하게 고려하세요.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedAmount: { type: Type.INTEGER },
            reasoning: { type: Type.STRING }
          },
          required: ["predictedAmount", "reasoning"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("AI 응답이 비어있습니다.");

    return JSON.parse(jsonText) as PredictionResult;
  } catch (error) {
    console.error("Prediction Error:", error);
    throw error;
  }
};
