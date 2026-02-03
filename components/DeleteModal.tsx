import React from 'react';
import { X, Trash2, AlertTriangle } from 'lucide-react';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName?: string;
  count?: number; // New prop for bulk deletion
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, productName, count = 0 }) => {
  if (!isOpen) return null;

  const isBulk = count > 1;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a0505] border border-red-900/50 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] w-full max-w-sm overflow-hidden flex flex-col">
        
        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20 shadow-[0_0_15px_rgba(220,38,38,0.1)]">
             <AlertTriangle size={32} className="text-red-500" />
          </div>
          
          <h3 className="text-xl font-bold text-white mb-2">
            {isBulk ? `Excluir ${count} Itens?` : 'Excluir Item?'}
          </h3>
          
          <p className="text-sm text-gray-400 mb-2 leading-relaxed">
            {isBulk 
              ? 'Você está prestes a remover permanentemente os itens selecionados.' 
              : 'Você está prestes a remover permanentemente:'}
          </p>
          
          {!isBulk && productName && (
             <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-2 mb-4 text-xs font-bold text-red-200 font-mono break-words uppercase">
                {productName}
             </div>
          )}

          <p className="text-[10px] text-gray-500 font-medium">
            Essa ação não pode ser desfeita. O histórico de vendas será mantido, mas {isBulk ? 'os itens sairão' : 'o item sairá'} do inventário.
          </p>
        </div>

        <div className="p-4 bg-[#0f0202] border-t border-red-900/20 flex gap-3">
           <button 
             type="button"
             onClick={onClose}
             className="flex-1 py-3 rounded-lg bg-[#1a0505] text-gray-400 font-bold border border-white/10 hover:bg-white/5 hover:text-white transition text-xs uppercase tracking-wider"
           >
             Cancelar
           </button>
           <button 
             type="button"
             onClick={() => { onConfirm(); onClose(); }}
             className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold shadow-lg shadow-red-900/40 flex items-center justify-center gap-2 transition transform active:scale-95 text-xs uppercase tracking-wider border-t border-white/20"
           >
             <Trash2 size={16} /> Confirmar
           </button>
        </div>

      </div>
    </div>
  );
};

export default DeleteModal;