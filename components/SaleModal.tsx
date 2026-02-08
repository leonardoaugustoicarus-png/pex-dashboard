import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, CheckCheck, Box, Hash } from 'lucide-react';
import { Product } from '../types';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (matricula: string, quantity: number, batch: string) => void;
  product: Product | null;
}

const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onConfirm, product }) => {
  const [matricula, setMatricula] = useState('');
  const [quantity, setQuantity] = useState<number | string>(1);
  const [batch, setBatch] = useState('');

  // Reset/Initialize form when product changes
  useEffect(() => {
    if (isOpen && product) {
      setMatricula('');
      setQuantity(1);
      setBatch(product.batch || '');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricula || !quantity) return;

    onConfirm(matricula, Number(quantity), batch);
  };

  const maxQuantity = product.quantity;

  const inputBaseClass = "w-full bg-[#05100a] border border-green-900 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition font-medium tracking-wide";
  const labelClass = "text-[10px] font-bold text-gray-400 uppercase ml-1 mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f2015] border border-green-900/50 rounded-2xl shadow-[0_0_40px_rgba(22,163,74,0.2)] w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-500/30">
              <ShoppingCart size={24} className="text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Confirmar Venda</h3>
            <p className="text-green-400/80 text-xs uppercase tracking-wider font-bold truncate px-4">{product.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Row: Quantity & Batch */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}><Box size={10} className="inline mr-1" /> Quantidade</label>
                <input
                  required
                  type="number"
                  min="1"
                  max={maxQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className={`${inputBaseClass} text-center text-lg font-bold`}
                />
                <div className="text-[9px] text-green-500/60 text-center mt-1 font-mono">
                  DISPONÍVEL: {maxQuantity}
                </div>
              </div>
              <div>
                <label className={labelClass}><Hash size={10} className="inline mr-1" /> Lote</label>
                <input
                  type="text"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value.toUpperCase())}
                  className={`${inputBaseClass} text-center uppercase`}
                />
              </div>
            </div>

            {/* Seller ID */}
            <div>
              <label className={labelClass}>Matrícula do Vendedor</label>
              <input
                autoFocus
                required
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Digite sua matrícula..."
                className={`${inputBaseClass} text-center`}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-lg bg-[#1a2e22] text-gray-300 font-bold border border-transparent hover:bg-[#233a2b] transition text-sm"
              >
                CANCELAR
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold shadow-lg shadow-green-900/40 flex items-center justify-center gap-2 transition transform active:scale-95 text-sm"
              >
                <CheckCheck size={18} /> CONFIRMAR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SaleModal;