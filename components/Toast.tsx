import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X, AlertTriangle, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000); // Auto close after 4s

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const variants = {
    success: {
      icon: CheckCircle,
      wrapper: 'bg-gradient-to-r from-emerald-900/90 to-green-950/90 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.15)]',
      iconBg: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40',
      title: 'text-emerald-100',
      desc: 'text-emerald-200/70',
      progress: 'bg-emerald-500'
    },
    error: {
      icon: AlertCircle,
      wrapper: 'bg-gradient-to-r from-red-900/90 to-rose-950/90 border-red-500/30 shadow-[0_4px_20px_rgba(239,68,68,0.15)]',
      iconBg: 'bg-red-500/20 text-red-400 ring-1 ring-red-500/40',
      title: 'text-red-100',
      desc: 'text-red-200/70',
      progress: 'bg-red-500'
    },
    warning: {
      icon: AlertTriangle,
      wrapper: 'bg-gradient-to-r from-amber-900/90 to-orange-950/90 border-amber-500/30 shadow-[0_4px_20px_rgba(245,158,11,0.15)]',
      iconBg: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40',
      title: 'text-amber-100',
      desc: 'text-amber-200/70',
      progress: 'bg-amber-500'
    },
    info: {
      icon: Info, // Or Loader2 if you want to imply processing
      wrapper: 'bg-gradient-to-r from-blue-900/90 to-slate-900/90 border-blue-500/30 shadow-[0_4px_20px_rgba(59,130,246,0.15)]',
      iconBg: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40',
      title: 'text-blue-100',
      desc: 'text-blue-200/70',
      progress: 'bg-blue-400'
    }
  };

  const style = variants[toast.type];
  const Icon = style.icon;

  return (
    <div className={`relative flex items-center gap-4 p-4 rounded-2xl border backdrop-blur-xl w-full md:min-w-[360px] max-w-sm animate-in slide-in-from-right-full fade-in duration-300 mb-3 group overflow-hidden ${style.wrapper}`}>
      
      {/* Icon Container */}
      <div className={`p-2.5 rounded-xl flex-shrink-0 ${style.iconBg} shadow-inner`}>
        <Icon size={20} className={toast.type === 'info' && toast.title.includes('Gerando') ? 'animate-spin' : ''} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-1">
        <h4 className={`text-sm font-bold tracking-wide ${style.title} mb-1 drop-shadow-sm`}>
          {toast.title}
        </h4>
        <p className={`text-xs font-medium leading-relaxed truncate ${style.desc}`}>
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button 
        onClick={() => onClose(toast.id)}
        className="p-1.5 rounded-lg text-white/20 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
      >
        <X size={16} />
      </button>
      
      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-black/20">
        <div className={`h-full ${style.progress} shadow-[0_0_10px_currentColor] w-full animate-[shrink_4s_linear_forwards] origin-left rounded-r-full`}></div>
      </div>

      {/* Glass Shine Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

      <style>{`
        @keyframes shrink {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;