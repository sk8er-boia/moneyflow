import React from 'react';
import { X, Mail, Copy, Check } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="font-black text-gray-800 tracking-tight uppercase">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar text-sm text-gray-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export const LegalModals = ({ 
  activeModal, 
  onClose 
}: { 
  activeModal: 'terms' | 'privacy' | 'contact' | null; 
  onClose: () => void;
}) => {
  const [copied, setCopied] = React.useState(false);
  const email = 'mash_melow@naver.com';

  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Modal isOpen={activeModal === 'terms'} onClose={onClose} title="이용약관">
        <div className="space-y-4">
          <section>
            <h4 className="font-bold text-gray-800 mb-2">제 1 조 (목적)</h4>
            <p>본 약관은 MoneyFlow AI(이하 "서비스")가 제공하는 제반 서비스의 이용과 관련하여 서비스와 이용자의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 mb-2">제 2 조 (서비스의 내용)</h4>
            <p>서비스는 이용자의 수입, 지출 내역을 기록하고 통계 및 AI 분석 기능을 제공하는 자산 관리 도구입니다. 모든 데이터는 이용자의 브라우저 로컬 스토리지에 저장됩니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 mb-2">제 3 조 (데이터의 책임)</h4>
            <p>본 서비스는 서버에 데이터를 저장하지 않으며, 이용자의 기기 분실, 브라우저 캐시 삭제 등으로 인한 데이터 손실에 대해 책임을 지지 않습니다. 주기적인 백업 기능을 이용할 것을 권장합니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 mb-2">제 4 조 (면책조항)</h4>
            <p>서비스에서 제공하는 AI 분석 결과 및 통계 데이터는 참고용이며, 실제 금융 결정에 대한 책임은 이용자 본인에게 있습니다.</p>
          </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'privacy'} onClose={onClose} title="개인정보처리방침">
        <div className="space-y-4">
          <section>
            <h4 className="font-bold text-gray-800 mb-2">1. 개인정보의 수집</h4>
            <p>MoneyFlow AI는 별도의 회원가입 절차가 없으며, 서버로 어떠한 개인정보도 전송하거나 수집하지 않습니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 mb-2">2. 데이터의 저장 (로컬 스토리지)</h4>
            <p>이용자가 입력한 모든 금융 데이터는 이용자의 웹 브라우저 내 '로컬 스토리지(Local Storage)'에만 저장됩니다. 이는 이용자의 기기 내에서만 접근 가능합니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 mb-2">3. 제3자 제공</h4>
            <p>본 서비스는 수집하는 정보가 없으므로 제3자에게 정보를 제공하지 않습니다. 다만, 이용자가 직접 AI 분석 기능을 사용할 경우, 분석을 위해 익명화된 거래 내역이 AI 모델(Gemini)로 전송될 수 있습니다.</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-800 mb-2">4. 이용자의 권리</h4>
            <p>이용자는 언제든지 브라우저의 데이터를 삭제하거나 서비스 내 '데이터 초기화' 기능을 통해 모든 기록을 파기할 수 있습니다.</p>
          </section>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'contact'} onClose={onClose} title="문의하기">
        <div className="text-center py-8 space-y-6">
          <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-full mb-2">
            <Mail size={40} />
          </div>
          <div>
            <h4 className="text-xl font-black text-gray-800 mb-2">무엇을 도와드릴까요?</h4>
            <p className="text-gray-500">서비스 이용 중 불편한 점이나 개선 제안이 있다면<br/>아래 이메일로 연락 주시기 바랍니다.</p>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex items-center justify-between max-w-sm mx-auto">
            <span className="font-mono font-bold text-indigo-900">{email}</span>
            <button 
              onClick={handleCopy}
              className={`p-2 rounded-xl transition-all ${copied ? 'bg-emerald-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 shadow-sm border border-gray-100'}`}
            >
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          </div>
          
          <div className="pt-4">
            <a 
              href={`mailto:${email}`}
              className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
            >
              메일 보내기
            </a>
          </div>
        </div>
      </Modal>
    </>
  );
};
