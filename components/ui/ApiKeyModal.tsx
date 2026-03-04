import React, { useState } from 'react';
import { Key, X, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!key.trim()) {
      setError('API 키를 입력해 주세요.');
      return;
    }
    if (!key.startsWith('AIza')) {
      setError('올바른 Gemini API 키 형식이 아닙니다.');
      return;
    }
    onSave(key.trim());
    setKey('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-indigo-50"
          >
            <div className="bg-indigo-600 p-6 text-white relative">
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Key size={24} />
                </div>
                <h2 className="text-xl font-black tracking-tight">AI 프리미엄 기능 활성화</h2>
              </div>
              <p className="text-indigo-100 text-sm">
                AI 분석 기능을 사용하려면 Gemini API 키가 필요합니다.
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
                  <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                  <p className="text-xs text-blue-800 leading-relaxed">
                    입력하신 API 키는 브라우저의 <strong>로컬 스토리지에만 안전하게 저장</strong>되며, 서버로 전송되지 않습니다.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={key}
                      onChange={(e) => {
                        setKey(e.target.value);
                        setError('');
                      }}
                      placeholder="AIza..."
                      className={`w-full bg-gray-50 border ${error ? 'border-red-300 ring-2 ring-red-50' : 'border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50'} rounded-2xl px-4 py-3 text-sm outline-none transition-all`}
                    />
                    {error && (
                      <div className="flex items-center gap-1 mt-2 text-red-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={12} />
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors py-2"
                >
                  API 키가 없으신가요? 여기서 무료로 발급받기
                  <ExternalLink size={12} />
                </a>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-2xl border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  키 저장 및 시작
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
