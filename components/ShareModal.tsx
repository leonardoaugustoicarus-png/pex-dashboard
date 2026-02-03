import React from 'react';
import { X, Copy, CheckCircle2, Share2 } from 'lucide-react';
import { Product } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, product }) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !product) return null;

  const productDetails = `
PRODUTO: ${product.name}
EAN: ${product.ean || 'N/A'}
LOTE: ${product.batch}
QUANTIDADE: ${product.quantity}
VALIDADE: ${new Date(product.expiryDate).toLocaleDateString('pt-BR')}
MATRÍCULA: ${product.registration || 'N/A'}
SEÇÃO: ${product.section || 'N/A'}
TRANSFERÊNCIA: ${product.transfer || 'N/A'}
OBS: ${product.notes || 'N/A'}
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(productDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1e1e2e] border border-blue-900/50 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">

        {/* Header */}
        <div className="bg-[#2a2a3c] p-4 flex justify-between items-center border-b border-white/5">
          <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
            <Share2 size={18} /> Detalhes do Produto
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-[#0f0f15] p-4 rounded-lg border border-white/5 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
            {productDetails}
          </div>

          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all duration-300 ${copied
                ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
              }`}
          >
            {copied ? (
              <><CheckCircle2 size={18} /> COPIADO COM SUCESSO</>
            ) : (
              <><Copy size={18} /> COPIAR INFORMAÇÕES</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;