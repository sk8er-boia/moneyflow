import React from 'react';
import { Wallet, Sparkles, TrendingUp, Shield, ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface LandingPageProps {
  onStart: () => void;
  onOpenLegal: (type: 'terms' | 'privacy' | 'contact') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onOpenLegal }) => {
  return (
    <div className="min-h-screen bg-[#f5f5f4] text-[#0a0a0a] font-sans selection:bg-indigo-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-black/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <Wallet size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight">MoneyFlow AI</span>
        </div>
        <button 
          onClick={onStart}
          className="px-5 py-2 bg-[#0a0a0a] text-white rounded-full text-sm font-medium hover:bg-indigo-600 transition-colors"
        >
          앱 시작하기
        </button>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles size={14} /> AI 기반 개인 재무 관리
              </div>
              <h1 className="text-5xl lg:text-8xl font-black leading-[1.1] tracking-tighter mb-8">
                당신의 돈을 <br />
                <span className="text-indigo-600">더 똑똑하게</span> <br />
                흐르게 하세요
              </h1>
              <p className="text-xl text-gray-500 max-w-lg mb-12 leading-relaxed">
                MoneyFlow AI는 단순한 가계부를 넘어, 당신의 소비 패턴을 분석하고 더 나은 재정적 미래를 위한 인사이트를 제공합니다.
              </p>
              <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <button 
                    onClick={onStart}
                    className="px-10 py-8 bg-[#0a0a0a] text-white rounded-[2rem] text-3xl font-black flex flex-col items-start justify-center gap-2 hover:bg-indigo-600 transition-all group shadow-[0_20px_50px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/20 hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2 text-indigo-400 text-sm font-bold uppercase tracking-[0.2em]">
                      <Sparkles size={16} /> 100% Free
                    </div>
                    <div className="leading-none text-left">
                      지금 무료로 <br />
                      <span className="flex items-center gap-3">
                        시작하기 <ArrowRight size={32} className="group-hover:translate-x-3 transition-transform" />
                      </span>
                    </div>
                  </button>
                  
                  <div className="flex flex-col gap-3 px-2">
                    <div className="flex -space-x-3">
                      {[1, 2, 3, 4].map((i) => (
                        <img 
                          key={i}
                          src={`https://picsum.photos/seed/user${i}/100/100`} 
                          className="w-12 h-12 rounded-full border-4 border-white shadow-sm"
                          referrerPolicy="no-referrer"
                          alt="User"
                        />
                      ))}
                    </div>
                    <div className="text-sm font-bold text-gray-500">
                      <span className="text-[#0a0a0a] text-lg">1,000+</span> 명의 사용자가 선택
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="bg-white rounded-[2rem] shadow-2xl border border-black/5 overflow-hidden">
                <img 
                  src="https://picsum.photos/seed/dashboard/1200/800" 
                  alt="Dashboard Preview" 
                  className="w-full h-auto"
                  referrerPolicy="no-referrer"
                />
              </div>
              {/* Floating Elements */}
              <div className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl border border-black/5 rotate-6 hidden sm:block">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">이번 달 저축</div>
                    <div className="text-lg font-bold">+24.5%</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-black/5 -rotate-3 hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase">보안 수준</div>
                    <div className="text-lg font-bold">최상급 (AES-256)</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-bold tracking-tight mb-4">재무 관리가 이렇게 쉬워집니다.</h2>
              <p className="text-gray-500">복잡한 엑셀 시트는 잊으세요. MoneyFlow AI가 모든 것을 자동화하고 시각화합니다.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "AI 소비 분석",
                  desc: "Gemini AI가 당신의 소비 습관을 분석하여 맞춤형 절약 팁을 제공합니다.",
                  icon: <Sparkles className="text-indigo-600" />,
                  bg: "bg-indigo-50"
                },
                {
                  title: "직관적인 대시보드",
                  desc: "수입과 지출, 자산 현황을 한눈에 파악할 수 있는 아름다운 차트를 제공합니다.",
                  icon: <TrendingUp className="text-emerald-600" />,
                  bg: "bg-emerald-50"
                },
                {
                  title: "안전한 데이터 관리",
                  desc: "모든 데이터는 로컬에 안전하게 저장되며, 언제든지 백업하고 복구할 수 있습니다.",
                  icon: <Shield className="text-blue-600" />,
                  bg: "bg-blue-50"
                }
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-3xl border border-black/5 hover:border-indigo-200 transition-colors group">
                  <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6">
          <div className="max-w-5xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-8">지금 바로 시작하세요.</h2>
              <p className="text-indigo-100 text-lg mb-12 max-w-xl mx-auto">
                더 이상 미루지 마세요.<br />
                오늘부터 MoneyFlow AI와 함께 더 나은 재정적 미래를 설계하세요.
              </p>
              <button 
                onClick={onStart}
                className="px-12 py-6 bg-white text-indigo-600 rounded-3xl text-2xl font-black hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105 active:scale-95 leading-tight"
              >
                지금 무료로 <br />
                시작하기
              </button>
            </div>
            {/* Background Accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 border-t border-black/5 text-center text-gray-400 text-sm">
        <p>© 2026 MoneyFlow AI. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <button onClick={() => onOpenLegal('terms')} className="hover:text-indigo-600 transition-colors">이용약관</button>
          <button onClick={() => onOpenLegal('privacy')} className="hover:text-indigo-600 transition-colors">개인정보처리방침</button>
          <button onClick={() => onOpenLegal('contact')} className="hover:text-indigo-600 transition-colors">문의하기</button>
        </div>
      </footer>
    </div>
  );
};
