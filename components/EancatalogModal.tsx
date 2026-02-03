import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ClipboardList, Barcode, Copy, Check, AlertTriangle, Edit, Trash2, RotateCcw } from 'lucide-react';
import { Product } from './ProductTable';

interface EancatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  products?: Product[];
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (id: string) => void;
}

const EancatalogModal: React.FC<EancatalogModalProps> = ({ 
  isOpen, onClose, onSave, 
  products = [], onEditProduct, onDeleteProduct 
}) => {
  const [formData, setFormData] = useState({
    ean: '',
    name: ''
  });
  const [copied, setCopied] = useState(false);
  const [existingItem, setExistingItem] = useState<Product | null>(null);

  // Refs for focus management
  const eanInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Initialize/Reset
  useEffect(() => {
    if (isOpen) {
        setFormData({ ean: '', name: '' });
        setExistingItem(null);
        // Delay focus slightly to ensure modal is rendered
        setTimeout(() => eanInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Check for duplicates whenever EAN changes
  useEffect(() => {
    const cleanEan = formData.ean.trim();
    if (cleanEan && cleanEan.length > 3) {
        const found = products.find(p => (p.ean || '').trim() === cleanEan);
        setExistingItem(found || null);
    } else {
        setExistingItem(null);
    }
  }, [formData.ean, products]);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Validation
    if (!formData.name.trim() || !formData.ean.trim()) return;
    if (existingItem) return; // Prevent saving duplicate if somehow bypassed
    
    onSave(formData);
    
    // Reset state for next entry
    setFormData({ ean: '', name: '' }); 
    setExistingItem(null);
    
    // Focus back to EAN for continuous scanning
    setTimeout(() => {
        eanInputRef.current?.focus();
    }, 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Force uppercase for name
    const updatedValue = name === 'name' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: updatedValue }));
  };

  // Robust Enter Key Handling
  const handleKeyDown = (e: React.KeyboardEvent, field: 'ean' | 'name') => {
    if (e.key === 'Enter') {
        e.preventDefault(); // Always prevent default form submit to handle manually
        
        if (field === 'ean') {
             // If EAN entered, move to Name (unless duplicate found)
            if (!existingItem && formData.ean) {
                nameInputRef.current?.focus();
            }
        } else if (field === 'name') {
            // If Name entered, submit
            handleSubmit();
        }
    }
  };

  const handleCopy = async () => {
    if (!formData.ean) return;
    try {
        await navigator.clipboard.writeText(formData.ean);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } catch (err) {
        console.error("Failed to copy:", err);
    }
  };

  const handleReset = () => {
      setFormData({ ean: '', name: '' });
      setExistingItem(null);
      setTimeout(() => eanInputRef.current?.focus(), 0);
  };

  const inputClass = "w-full bg-[#0f0404] border border-[#1e293b] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-sm font-medium tracking-wide disabled:opacity-50 disabled:cursor-not-allowed";
  const labelClass = "text-[11px] font-bold text-orange-500/80 uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#111] border border-blue-900/30 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.1)] w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header - Blue Theme */}
        <div className="bg-[#1e1e2e] p-5 flex justify-between items-center border-b border-blue-900/30">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList size={22} className="text-blue-500" />
            Registro de Catálogo
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition hover:bg-blue-900/20 p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Form Area */}
        <div className="p-6 relative">
          
          <form id="ean-catalog-form" onSubmit={handleSubmit} className="space-y-6">
            
            {/* EAN */}
            <div>
              <label className={labelClass}>EAN / Código de Barras</label>
              <div className="relative">
                <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  ref={eanInputRef}
                  id="ean-input"
                  required
                  type="text"
                  name="ean"
                  value={formData.ean}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'ean')}
                  className={`${inputClass} pl-10 pr-10 font-mono ${existingItem ? 'border-orange-500/50 bg-orange-900/10' : ''}`}
                  placeholder="0000000000000"
                  autoFocus
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-400 transition"
                  title="Copiar EAN"
                >
                  {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Existing Item Alert Overlay */}
            {existingItem && (
               <div className="bg-[#1a0505] border border-orange-500/30 rounded-xl p-4 shadow-lg animate-in slide-in-from-top-2 fade-in">
                  <div className="flex items-start gap-3">
                      <div className="p-2 bg-orange-500/10 rounded-lg shrink-0">
                          <AlertTriangle size={20} className="text-orange-500" />
                      </div>
                      <div className="flex-1">
                          <h4 className="text-sm font-bold text-orange-200 uppercase mb-1">Item Já Cadastrado</h4>
                          <p className="text-xs text-gray-400 mb-2 font-mono">{existingItem.name}</p>
                          <div className="flex flex-col gap-2">
                              <span className="text-[10px] text-gray-500">O que deseja fazer com este item?</span>
                              <div className="flex gap-2">
                                  {onEditProduct && (
                                    <button 
                                        type="button"
                                        onClick={() => onEditProduct(existingItem)}
                                        className="flex-1 bg-blue-900/30 hover:bg-blue-900/50 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                                    >
                                        <Edit size={14} /> EDITAR
                                    </button>
                                  )}
                                  {onDeleteProduct && (
                                    <button 
                                        type="button"
                                        onClick={() => { onDeleteProduct(existingItem.id); setExistingItem(null); }}
                                        className="flex-1 bg-red-900/30 hover:bg-red-900/50 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                                    >
                                        <Trash2 size={14} /> EXCLUIR
                                    </button>
                                  )}
                              </div>
                              <button 
                                  type="button"
                                  onClick={handleReset}
                                  className="w-full bg-white/5 hover:bg-white/10 text-gray-400 border border-white/10 px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition"
                                >
                                    <RotateCcw size={14} /> LIMPAR E INSERIR OUTRO
                                </button>
                          </div>
                      </div>
                  </div>
               </div>
            )}

            {/* Name - Disabled if duplicate found to prevent confusion, unless user clears */}
            <div className={existingItem ? 'opacity-40 pointer-events-none' : ''}>
              <label className={labelClass}>Nome do Produto *</label>
              <input 
                ref={nameInputRef}
                required={!existingItem}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'name')}
                className={`${inputClass} uppercase`}
                placeholder="EX: DIPIRONA 500MG C/10CP (PRATI)"
                autoComplete="off"
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#0a0a0a] border-t border-blue-900/30 flex justify-between gap-4">
           {!existingItem ? (
                <button 
                    type="submit"
                    form="ean-catalog-form"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 transition transform active:scale-95"
                >
                    <Save size={20} /> SALVAR REGISTRO
                </button>
           ) : (
               <div className="flex-1 text-center text-xs text-gray-500 py-3 font-mono">
                   Ação requerida acima
               </div>
           )}
          <button 
            type="button" 
            onClick={onClose}
            className="px-8 py-3 rounded-lg bg-[#1a1a1a] text-white font-bold border border-[#333] hover:bg-[#2a2a2a] transition"
          >
            SAIR
          </button>
        </div>

      </div>
    </div>
  );
};

export default EancatalogModal;