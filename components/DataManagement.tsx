
import React, { useRef, useState } from 'react';
import { Download, Upload, X, Save, AlertCircle, FileJson, RefreshCw } from 'lucide-react';
import { Transaction } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  onImport: (data: any) => void;
  onEmergencyRestore: () => void;
  onExport: () => void; // New prop for reusability
}

export const DataManagement: React.FC<Props> = ({ isOpen, onClose, transactions, onImport, onEmergencyRestore, onExport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && file.type !== 'application/json') {
       setError('JSON 파일만 업로드할 수 있습니다.');
       e.target.value = '';
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Handle both Array (Legacy) and Object (New BackupData) formats
        const isLegacyArray = Array.isArray(json);
        const isNewBackup = typeof json === 'object' && json !== null && (Array.isArray(json.transactions) || json.transactions === undefined);

        if (isLegacyArray || isNewBackup) {
             onImport(json); // Let App.tsx handle the structure details
             setSuccessMsg('데이터가 성공적으로 복구되었습니다.');
             setError(null);
             setTimeout(() => {
                setSuccessMsg(null);
                onClose();
             }, 1500);
        } else {
          setError('파일 형식이 올바르지 않습니다.');
        }
      } catch (err) {
        setError('파일을 읽는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Save size={20} className="text-indigo-600" />
            데이터 백업 및 복구
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
             <div className="flex gap-3">
               <AlertCircle className="text-orange-600 shrink-0" size={20} />
               <p className="text-sm text-orange-800 leading-relaxed font-medium">
                 ⚠️ 데이터 유실 주의<br/>
                 <span className="font-normal text-gray-700">이 앱은 데이터를 브라우저에 저장합니다. 브라우저 청소나 오류로 데이터가 날아갈 수 있으니, </span>
                 <span className="font-bold text-red-600 underline">일주일에 한 번은 꼭 [백업하기]를 눌러 파일을 보관하세요.</span>
               </p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onExport}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-gray-100 hover:border-indigo-100 hover:bg-indigo-50 transition-all group"
            >
              <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full group-hover:scale-110 transition-transform">
                <Download size={24} />
              </div>
              <div className="text-center">
                <span className="block font-semibold text-gray-800">백업하기</span>
                <span className="text-xs text-gray-500">파일로 다운로드</span>
              </div>
            </button>

            <button
              onClick={handleImportClick}
              className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-gray-100 hover:border-emerald-100 hover:bg-emerald-50 transition-all group"
            >
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full group-hover:scale-110 transition-transform">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <span className="block font-semibold text-gray-800">복구하기</span>
                <span className="text-xs text-gray-500">파일 불러오기</span>
              </div>
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".json" 
              className="hidden" 
            />
          </div>
          
          <div className="border-t border-gray-100 pt-4">
             <button
                onClick={onEmergencyRestore}
                className="w-full py-3 rounded-xl border border-red-100 bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
                <RefreshCw size={16} />
                비상 백업에서 복구하기 (데이터가 안 보일 때)
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
              <FileJson size={16} />
              {successMsg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
