
import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download, Monitor, Command, Menu, Smartphone, Laptop, Star, Bookmark } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstall: () => void;
}

export const InstallGuide: React.FC<Props> = ({ isOpen, onClose, deferredPrompt, onInstall }) => {
  const [tab, setTab] = useState<'mac_pc' | 'mobile' | 'bookmark'>('mac_pc');

  // Auto-detect device type for initial tab selection
  useEffect(() => {
    if (isOpen) {
        if (deferredPrompt) {
            // If prompt available, stay on default or handle separately (the prompt UI handles this)
        } else {
             const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
             setTab(isMobile ? 'mobile' : 'mac_pc');
        }
    }
  }, [isOpen, deferredPrompt]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <Download size={20} className="text-indigo-600" />
            앱 설치 가이드
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          
          {/* 1. Automatic Install Section (Priority) */}
          {deferredPrompt ? (
            <div className="mb-8 text-center animate-in zoom-in duration-300">
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-indigo-600">
                  <Download size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">MoneyFlow AI 설치</h4>
                <p className="text-gray-600 text-sm mb-6">
                  현재 브라우저에서 바로 설치가 가능합니다.<br/>
                  Dock이나 홈 화면에 아이콘이 생성됩니다.
                </p>
                <button 
                  onClick={() => {
                      onInstall();
                      onClose(); // Close guide after triggering prompt
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-bold py-3.5 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                  지금 설치하기
                </button>
              </div>
              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-2 text-xs text-gray-400">또는 수동으로 설치</span>
                </div>
              </div>
            </div>
          ) : (
             <div className="mb-6 bg-gray-50 p-4 rounded-xl text-center text-sm text-gray-600 border border-gray-100">
                <p><strong>자동 설치</strong>가 지원되지 않는 브라우저입니다.<br/>아래 탭에서 <strong>수동 설치</strong> 또는 <strong>즐겨찾기</strong> 방법을 확인하세요.</p>
             </div>
          )}

          {/* 2. Manual Install Tabs */}
          <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-xl">
             <button
              onClick={() => setTab('mac_pc')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                tab === 'mac_pc' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Laptop size={16} /> PC/Mac
            </button>
            <button
              onClick={() => setTab('mobile')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                tab === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Smartphone size={16} /> 모바일
            </button>
             <button
              onClick={() => setTab('bookmark')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${
                tab === 'bookmark' ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Star size={16} /> 즐겨찾기
            </button>
          </div>

          {/* 3. Manual Instructions Content */}
          {tab === 'mac_pc' && (
            <div className="space-y-6">
               {/* Chrome Section */}
               <div className="group">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <img src="https://cdn-icons-png.flaticon.com/512/888/888846.png" className="w-5 h-5" alt="Chrome" />
                    Chrome / Edge (Mac & Windows)
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-2 group-hover:bg-blue-50 transition-colors">
                     <p>1. 주소창 오른쪽 끝의 <strong>모니터 아이콘(📥)</strong> 클릭</p>
                     <p>2. <strong>'설치'</strong> 버튼 클릭</p>
                  </div>
               </div>

               {/* Safari Section */}
               <div className="group">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <img src="https://cdn-icons-png.flaticon.com/512/888/888849.png" className="w-5 h-5" alt="Safari" />
                    Safari (Mac)
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-2 group-hover:bg-blue-50 transition-colors">
                     <p className="flex items-center gap-2">
                        <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">File</span>
                        메뉴에서 <strong>[파일]</strong> 클릭
                     </p>
                     <p className="flex items-center gap-2">
                        <span className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-xs font-mono">Add to Dock</span>
                        <strong>[Dock에 추가...]</strong> 클릭
                     </p>
                     <p className="text-xs text-gray-500 mt-2">* macOS Sonoma 이상 버전 필요</p>
                  </div>
               </div>
            </div>
          )}

          {tab === 'mobile' && (
            <div className="space-y-6">
              {/* iOS Section */}
              <div className="group">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                     <img src="https://cdn-icons-png.flaticon.com/512/888/888849.png" className="w-5 h-5" alt="Safari" />
                     iPhone / iPad (Safari)
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-3 group-hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Share className="text-blue-500 shrink-0" size={20} />
                        <span>하단 <strong>공유 버튼</strong> 터치</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <PlusSquare className="text-gray-500 shrink-0" size={20} />
                        <span><strong>'홈 화면에 추가'</strong> 선택</span>
                      </div>
                  </div>
              </div>

              {/* Android Section */}
              <div className="group">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                     <img src="https://cdn-icons-png.flaticon.com/512/888/888846.png" className="w-5 h-5" alt="Chrome" />
                     Android (Chrome)
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-3 group-hover:bg-blue-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Menu className="text-gray-500 shrink-0" size={20} />
                        <span>상단 <strong>메뉴(점 3개)</strong> 터치</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Download className="text-gray-500 shrink-0" size={20} />
                        <span><strong>'앱 설치'</strong> 또는 <strong>'홈 화면에 추가'</strong> 선택</span>
                      </div>
                  </div>
              </div>
            </div>
          )}

          {tab === 'bookmark' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-gray-700">
                      <p className="mb-2 font-bold text-yellow-800">설치가 안 되거나 복잡하신가요?</p>
                      <p>브라우저의 <strong>즐겨찾기(북마크)</strong> 기능을 사용해도 똑같이 편리합니다.</p>
                  </div>
                  
                  <div className="group">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Command size={18} /> Mac (모든 브라우저)
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 flex items-center gap-2">
                          <span className="bg-white border border-gray-200 px-2 py-1 rounded font-mono text-xs shadow-sm">Command ⌘</span>
                          <span>+</span>
                          <span className="bg-white border border-gray-200 px-2 py-1 rounded font-mono text-xs shadow-sm">D</span>
                          <span className="text-gray-500 text-xs ml-2">(단축키를 누르면 저장됩니다)</span>
                      </div>
                  </div>

                  <div className="group">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                          <Monitor size={18} /> Windows (모든 브라우저)
                      </h4>
                      <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 flex items-center gap-2">
                          <span className="bg-white border border-gray-200 px-2 py-1 rounded font-mono text-xs shadow-sm">Ctrl</span>
                          <span>+</span>
                          <span className="bg-white border border-gray-200 px-2 py-1 rounded font-mono text-xs shadow-sm">D</span>
                      </div>
                  </div>
              </div>
          )}

        </div>
      </div>
    </div>
  );
};
