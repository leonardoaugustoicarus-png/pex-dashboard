import React, { useState, useRef, useEffect } from 'react';
import { Settings, Maximize, Minus, EyeOff, AlertTriangle, Calendar, Clock, Pill } from 'lucide-react';

interface HeaderProps {
  expiredCount?: number;
}

const Header: React.FC<HeaderProps> = ({ expiredCount = 0 }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside & Timer logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        clearInterval(timer);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsMenuOpen(false);
  };

  // Logic to 'Minimize' (Exit Fullscreen)
  const handleMinimize = () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen();
    }
    setIsMenuOpen(false);
  };

  const formattedDate = currentTime.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase();
  const formattedTime = currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <header className="flex justify-between items-center px-6 py-2.5 bg-[#2c0a0a]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-[60] shadow-lg relative">
      
      {/* LEFT: PEX Visual Identity */}
      <div className="flex items-center gap-3">
        {/* Yellow Icon */}
        <div className="w-[38px] h-[38px] rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)] border border-white/10 group cursor-pointer hover:scale-105 transition-transform duration-300">
             <Pill className="text-[#2c0a0a] -rotate-45 fill-[#2c0a0a]/10 drop-shadow-sm" size={20} strokeWidth={2.5} />
        </div>

        {/* Text Block */}
        <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black text-white leading-[0.8] tracking-tight drop-shadow-md">PEX</h1>
            <span className="text-[9px] font-bold text-orange-500/90 tracking-[0.2em] uppercase mt-0.5">Sistema de Gestão</span>
        </div>
      </div>

      {/* CENTER: Real Time Info (Desktop Only) */}
      <div className="hidden xl:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2 bg-[#1a0505]/50 px-5 py-1.5 rounded-full border border-white/5 backdrop-blur-sm">
         <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={12} className="text-orange-500" />
            <span className="text-[10px] font-bold tracking-widest">{formattedDate}</span>
         </div>
         <div className="w-px h-3 bg-white/10"></div>
         <div className="flex items-center gap-2 text-gray-200">
            <Clock size={12} className="text-blue-500" />
            <span className="text-[10px] font-mono font-bold tracking-widest">{formattedTime}</span>
         </div>
      </div>

      {/* RIGHT: Drogaria Logo + Alerts + Settings */}
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        
        {/* Drogaria Total Popular Logo (Moved to Right) */}
        <div className="hidden lg:flex items-center gap-2 opacity-90 hover:opacity-100 transition-opacity">
            {/* Small Cross Icon */}
            <div className="bg-[#D6001C] w-7 h-7 rounded-md flex items-center justify-center shadow-md shadow-red-900/20 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                <div className="relative w-4 h-4">
                   <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[#FFF200] -translate-y-1/2 rounded-[1px]"></div>
                   <div className="absolute top-0 left-1/2 h-full w-[4px] bg-[#FFF200] -translate-x-1/2 rounded-[1px]"></div>
                </div>
            </div>
            {/* Small Text Block */}
            <div className="bg-[#D6001C] h-7 px-2.5 rounded-md shadow-md shadow-red-900/20 border border-white/5 flex flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50"></div>
                <span className="text-[#FFF200] text-[6px] font-black uppercase tracking-wider leading-none mb-0.5 relative z-10 text-left">DROGARIA TOTAL</span>
                <span className="text-white text-[10px] font-black italic leading-none tracking-tight relative z-10 font-sans">Popular</span>
            </div>
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-white/10 hidden lg:block"></div>

        {/* Critical Alert Widget */}
        {expiredCount > 0 && (
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-red-900/80 to-red-800/80 border border-red-500/30 px-3 py-1 rounded-full shadow-[0_0_25px_rgba(220,38,38,0.3)] animate-[pulse_3s_infinite] relative overflow-hidden group backdrop-blur-sm cursor-default">
              <div className="absolute inset-0 bg-white/5 transform skew-x-12 group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="bg-red-500/20 p-0.5 rounded-full border border-red-400/30">
                  <AlertTriangle size={12} className="text-red-200 fill-red-500/20" />
              </div>
              <div className="flex flex-col leading-none">
                  <span className="text-[7px] font-bold text-red-300 uppercase tracking-widest mb-0.5">Atenção</span>
                  <span className="text-[10px] font-black text-white tracking-wide">{expiredCount} VENCIDOS</span>
              </div>
          </div>
        )}

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-lg transition-all duration-300 border backdrop-blur-sm
            ${isMenuOpen 
              ? 'bg-orange-500/10 border-orange-500 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
              : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20'}`}
        >
          <Settings className={`w-4 h-4 ${isMenuOpen ? 'animate-spin-slow' : ''}`} />
        </button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-12 right-0 w-64 bg-[#1a0505]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/50">
            <div className="bg-white/5 px-4 py-3 border-b border-white/5">
              <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">Preferências</span>
            </div>
            
            <div className="p-1.5 space-y-1">
              <button 
                onClick={toggleFullscreen}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
              >
                <Maximize size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Tela Cheia</span>
              </button>

              <button 
                onClick={handleMinimize}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all group"
              >
                <Minus size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Minimizar</span>
              </button>

              <button 
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-all group"
              >
                <EyeOff size={16} className="text-red-500 group-hover:scale-110 transition-transform" />
                <span className="font-semibold text-xs">Modo Privacidade</span>
              </button>
            </div>

            <div className="bg-[#0f0202]/50 px-3 py-2 text-center border-t border-white/5">
              <span className="text-[9px] text-gray-500 font-mono tracking-wider">VERSÃO 3.5.0 PRO</span>
            </div>
          </div>
        )}
      </div>
      <style>{`
        .animate-spin-slow {
            animation: spin 4s linear infinite;
        }
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
};

export default Header;