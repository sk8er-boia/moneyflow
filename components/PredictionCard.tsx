import React, { useState } from 'react';
import { Sparkles, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { Card } from './ui/Card';
import { Transaction } from '../types';
import { predictNextMonthExpenses, PredictionResult } from '../services/geminiService';

interface Props {
  transactions: Transaction[];
}

export const PredictionCard: React.FC<Props> = ({ transactions }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePredict = async () => {
    if (transactions.length < 5) {
      setError("예측 정확도를 위해 최소 5건 이상의 지출 데이터가 필요합니다.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const prediction = await predictNextMonthExpenses(transactions);
      setResult(prediction);
    } catch (e) {
      setError("예측을 생성하는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="다음 달 지출 예측" className="h-auto">
      <div className="flex flex-col gap-4">
        {!result && !loading && (
          <div className="text-center py-6">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-purple-600" size={32} />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              과거 데이터를 기반으로<br />
              다음 달 예상 지출액을 분석합니다.
            </p>
            <button
              onClick={handlePredict}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
            >
              <TrendingUp size={18} />
              AI 예측 시작하기
            </button>
          </div>
        )}

        {loading && (
          <div className="text-center py-10 flex flex-col items-center">
            <Loader2 className="animate-spin text-purple-600 mb-3" size={32} />
            <p className="text-sm text-gray-500">지출 패턴을 분석 중입니다...</p>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500 mb-1">다음 달 예상 지출</p>
              <p className="text-3xl font-bold text-gray-800">
                {result.predictedAmount.toLocaleString()}원
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h4 className="text-xs font-bold text-purple-800 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles size={12} />
                AI 분석 결과
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                {result.reasoning}
              </p>
            </div>

            <button
              onClick={handlePredict}
              className="mt-4 w-full text-xs text-gray-400 hover:text-purple-600 underline"
            >
              다시 예측하기
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-50 p-3 rounded-lg flex items-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}
      </div>
    </Card>
  );
};
