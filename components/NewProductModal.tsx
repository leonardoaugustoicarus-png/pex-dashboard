import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Calendar, Box, Info, ArrowRightLeft, LayoutGrid, ScanBarcode, Check, Search } from 'lucide-react';
import { Product } from '../types';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Partial<Product>, 'quantity'> & { quantity: string | number }) => void;
  productToEdit?: Product | null;
  catalogReference?: Product[]; // List of existing products to use for autocomplete
}

const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen, onClose, onSave, productToEdit, catalogReference = []
}) => {
  const [formData, setFormData] = useState({
    ean: '',
    name: '',
    batch: '',
    registration: '', // Matrícula
    quantity: 1 as string | number, // Allow string during typing
    expiryDate: '',
    section: '',
    transfer: '',
    notes: ''
  });

  const [foundInCatalog, setFoundInCatalog] = useState(false);

  // Populate form when editing or clear when creating new
  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setFormData({
          ean: productToEdit.ean || '',
          name: productToEdit.name || '',
          batch: productToEdit.batch || '',
          registration: productToEdit.registration || '',
          quantity: productToEdit.quantity || 1,
          expiryDate: productToEdit.expiryDate || '',
          section: productToEdit.section || '',
          transfer: productToEdit.transfer || '',
          notes: productToEdit.notes || ''
        });
        setFoundInCatalog(false);
      } else {
        setFormData({
          ean: '', name: '', batch: '', registration: '',
          quantity: 1, expiryDate: '', section: '', transfer: '', notes: ''
        });
        setFoundInCatalog(false);
      }
    }
  }, [isOpen, productToEdit]);

  // Autocomplete Logic
  useEffect(() => {
    // Only run if not editing an existing product and we have an EAN
    if (!productToEdit && formData.ean && formData.ean.length > 3) {
      const match = catalogReference.find(p =>
        (p.ean === formData.ean) ||
        (p.batch === 'CATÁLOGO' && p.ean === formData.ean)
      );

      if (match) {
        setFormData(prev => ({
          ...prev,
          name: match.name,
          // Also autofill auxiliary fields to save time
          section: match.section || prev.section,
          transfer: match.transfer || prev.transfer,
          // Do not autofill registration (user ID) or batch (varies)
        }));
        setFoundInCatalog(true);
      } else {
        setFoundInCatalog(false);
      }
    } else if (!formData.ean) {
      setFoundInCatalog(false);
    }
  }, [formData.ean, productToEdit, catalogReference]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.expiryDate) return;

    onSave(formData);
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Auto convert to uppercase for text fields
    const upperValue = ['name', 'batch', 'registration', 'section', 'transfer'].includes(name)
      ? value.toUpperCase()
      : value;

    setFormData(prev => ({ ...prev, [name]: upperValue }));
  };

  // Prevent Enter key from submitting form on inputs (Scanner behavior usually sends Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Simple logic to move focus or just prevent submit
      const form = e.currentTarget.closest('form');
      if (form) {
        const index = Array.prototype.indexOf.call(form, e.target);
        const nextElement = form.elements[index + 1] as HTMLElement;
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  };

  const inputClass = "w-full bg-[#0f0404] border border-[#5a1515] rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition text-sm font-medium tracking-wide";
  const labelClass = "text-[11px] font-bold text-orange-500/80 uppercase tracking-wider mb-1 block";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a0505] border border-[#5a1515] rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-[#2c0a0a] p-5 flex justify-between items-center border-b border-[#5a1515]">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Save size={22} className="text-yellow-500" />
            {productToEdit ? 'Editar Produto' : 'Novo Produto'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition hover:bg-[#3d0e0e] p-1 rounded">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Area */}
        <div className="overflow-y-auto custom-scrollbar flex-1 p-6">
          <form id="new-product-form" onSubmit={handleSubmit} className="space-y-4">

            {/* EAN */}
            <div>
              <label className={`${labelClass} flex justify-between`}>
                <span>EAN / Código de Barras</span>
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors text-gray-500 group-focus-within:text-orange-500">
                  <ScanBarcode size={18} />
                </div>
                <input
                  type="text"
                  name="ean"
                  value={formData.ean}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  autoFocus={!productToEdit} // Auto focus on open for scanning
                  className={`${inputClass} pl-10 font-mono`}
                  placeholder="Bipe o produto ou digite..."
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <div className="flex justify-between items-end">
                <label className={labelClass}>Nome do Produto *</label>
                {foundInCatalog && (
                  <span className="text-[10px] text-green-400 font-bold flex items-center gap-1 mb-1 animate-pulse">
                    <Search size={10} /> Encontrado no Catálogo
                  </span>
                )}
              </div>
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                autoComplete="off"
                className={`${inputClass} uppercase ${foundInCatalog ? 'border-green-500/50 bg-green-900/10' : ''}`}
                placeholder="Descrição do produto..."
              />
            </div>

            {/* Row 1: Batch & Registration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Lote</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${inputClass} uppercase`}
                />
              </div>
              <div>
                <label className={labelClass}>Matrícula</label>
                <input
                  type="text"
                  name="registration"
                  value={formData.registration}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${inputClass} uppercase`}
                />
              </div>
            </div>

            {/* Row 2: Quantity & Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Quantidade</label>
                <input
                  required
                  type="number"
                  min="1"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${inputClass} text-xl font-bold`}
                />
              </div>
              <div>
                <label className={labelClass}>Validade *</label>
                <div className="relative">
                  <input
                    required
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    className={`${inputClass} [color-scheme:dark]`}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>

            {/* Row 3: Section & Transfer */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}><LayoutGrid size={12} className="inline mr-1 mb-0.5" /> Seção</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${inputClass} uppercase`}
                  placeholder="EX: A-1"
                />
              </div>
              <div>
                <label className={labelClass}><ArrowRightLeft size={12} className="inline mr-1 mb-0.5" /> Transferência</label>
                <input
                  type="text"
                  name="transfer"
                  value={formData.transfer}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={`${inputClass} uppercase`}
                  placeholder="EX: FILIAL 02"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}><Info size={12} className="inline mr-1 mb-0.5" /> Observações Gerais</label>
              <textarea
                rows={3}
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={inputClass}
                placeholder="Informações adicionais como fornecedor ou detalhes do item..."
              />
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-[#2c0a0a] border-t border-[#5a1515] flex justify-between gap-4">
          <button
            type="submit"
            form="new-product-form"
            className="flex-1 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/40 flex items-center justify-center gap-2 transition transform active:scale-95"
          >
            <Save size={20} /> {productToEdit ? 'ATUALIZAR' : 'SALVAR REGISTRO'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 rounded-lg bg-[#3d0e0e] text-white font-bold border border-[#5a1515] hover:bg-[#4a1212] transition"
          >
            SAIR
          </button>
        </div>

      </div>
    </div>
  );
};

export default NewProductModal;