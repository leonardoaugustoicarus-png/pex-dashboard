import React, { useState } from 'react';
import { User, Lock, LogIn, AlertCircle, ShieldCheck, Pill } from 'lucide-react';

interface LoginModalProps {
  onLoginSuccess: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulating a network delay for better UX feel
    setTimeout(() => {
      // Credentials Validation
      if (username.toUpperCase() === 'CATANDUVA' && password.toUpperCase() === 'LOJA04') {
        onLoginSuccess();
      } else {
        setError('Credenciais inválidas. Verifique o acesso.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0f0202] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#2c0a0a] via-[#0f0202] to-black">
      
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Login Card - Slide Down Animation */}
      <div className="relative w-full max-w-md p-1 animate-in slide-in-from-top-10 fade-in duration-700">
        
        {/* Border Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/30 to-transparent rounded-3xl blur-sm"></div>
        
        <div className="relative bg-[#150505]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="pt-10 pb-6 flex flex-col items-center justify-center relative">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.4)] mb-4 border border-white/20">
               <Pill className="text-[#2c0a0a] -rotate-45 fill-[#2c0a0a]/10" size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-md">PEX</h1>
            <p className="text-orange-500/80 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">
              Acesso Restrito
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-10">
            <form onSubmit={handleLogin} className="space-y-5">
              
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-200 text-xs font-medium animate-in slide-in-from-left-2">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Login (Unidade)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0202] border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 sm:text-sm transition-all uppercase"
                    placeholder="EX: CATANDUVA"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Senha de Acesso</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock size={18} className="text-gray-500 group-focus-within:text-orange-500 transition-colors" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-[#0a0202] border border-white/10 rounded-xl text-gray-200 placeholder-gray-600 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/10 sm:text-sm transition-all"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-[#2c0a0a] bg-gradient-to-r from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] active:scale-[0.98] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#2c0a0a] border-t-transparent rounded-full animate-spin"></div>
                    AUTENTICANDO...
                  </>
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={2.5} />
                    ACESSAR SISTEMA
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-gray-500">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-mono tracking-wider">AMBIENTE SEGURO & CRIPTOGRAFADO</span>
                </div>
                <span className="text-[9px] text-gray-600">v3.5.0 PRO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;