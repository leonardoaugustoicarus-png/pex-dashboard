import React, { useState, useEffect } from 'react';
import { ClipboardList, Edit, ShoppingCart, Trash2, Share2, AlertTriangle, AlertCircle, CheckCircle2, CheckSquare, X, FileText } from 'lucide-react';

import { Product } from '../types';

interface ProductTableProps {
  products: Product[];
  onDelete: (id: string) => void;
  onBulkDelete?: (ids: string[]) => void;
  onEdit: (product: Product) => void;
  onShare: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({ products, onDelete, onBulkDelete, onEdit, onShare, onAddToCart }) => {
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Selection Logic
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  // Clean selections if products are deleted externally
  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => products.some(p => p.id === id)));
  }, [products]);

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;

  const getStatusColor = (status: string, isCatalog: boolean) => {
    if (isCatalog) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    switch (status) {
      case 'expired': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'critical': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'safe': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string, isCatalog: boolean) => {
    if (isCatalog) return <FileText size={12} className="mr-1.5" />;
    switch (status) {
      case 'expired': return <AlertCircle size={12} className="mr-1.5" />;
      case 'critical': return <AlertTriangle size={12} className="mr-1.5" />;
      case 'safe': return <CheckCircle2 size={12} className="mr-1.5" />;
      default: return null;
    }
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-[#1a0505]/40 rounded-3xl border border-white/5 mt-4 border-dashed">
        <div className="bg-[#2c0a0a] p-3 rounded-full mb-3 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
          <ClipboardList size={24} className="text-orange-500/50" />
        </div>
        <h3 className="text-lg font-bold text-gray-400 mb-1">Lista Vazia</h3>
        <p className="text-gray-600 text-xs max-w-md text-center">
          Nenhum item encontrado. Utilize os filtros ou adicione novos produtos.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Table Container with Scroll & Max Height */}
      <div className="rounded-2xl border border-white/5 shadow-2xl bg-[#150505]/60 backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-orange-900 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-[#1f0505] shadow-md">
              <tr className="text-gray-400 text-[9px] uppercase tracking-wider font-bold border-b border-white/5">
                {/* Checkbox Column Header */}
                <th className="px-3 py-3 w-10 text-center bg-[#1f0505]">
                  <div className="relative inline-flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                      onChange={handleSelectAll}
                      className="peer appearance-none w-3.5 h-3.5 rounded border border-gray-600 bg-[#0a0202] checked:bg-orange-600 checked:border-orange-600 focus:ring-1 focus:ring-orange-500/50 cursor-pointer transition-colors"
                    />
                    <CheckSquare size={10} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </th>
                <th className="px-3 py-3 bg-[#1f0505]">Produto</th>
                <th className="px-3 py-3 bg-[#1f0505]">Lote</th>
                <th className="px-3 py-3 text-center bg-[#1f0505]">Qtd</th>
                <th className="px-3 py-3 text-center bg-[#1f0505]">Validade</th>
                <th className="px-3 py-3 text-center bg-[#1f0505]">Status</th>
                <th className="px-3 py-3 text-center bg-[#1f0505] min-w-[140px]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-medium">
              {products.map((product) => {
                const isCatalog = product.batch === 'CATÁLOGO';
                // Only consider sold out if qty is 0 AND it is NOT a catalog item
                const isSoldOut = product.quantity === 0 && !isCatalog;

                return (
                  <tr
                    key={product.id}
                    className={`
                      group transition-all duration-500 ease-in-out
                      ${product.isAnimatingOut ? 'translate-x-[100%] opacity-0' : 'translate-x-0 opacity-100'} 
                      ${isSoldOut && !product.isAnimatingOut ? 'bg-red-900/10 border-l-2 border-l-red-500 grayscale-[0.3]' : 'hover:bg-white/5'}
                      ${selectedIds.includes(product.id) && !isSoldOut ? 'bg-orange-500/5 hover:bg-orange-500/10' : ''}
                      ${isCatalog ? 'bg-blue-900/5' : ''}
                    `}
                  >
                    {/* Checkbox Column Row */}
                    <td className="px-3 py-2.5 text-center relative">
                      {!isSoldOut && (
                        <div className="relative inline-flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(product.id)}
                            onChange={() => handleSelectOne(product.id)}
                            className="peer appearance-none w-3.5 h-3.5 rounded border border-gray-600 bg-[#0a0202] checked:bg-orange-600 checked:border-orange-600 focus:ring-1 focus:ring-orange-500/50 cursor-pointer transition-colors"
                          />
                          <CheckSquare size={10} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
                        </div>
                      )}
                      {selectedIds.includes(product.id) && !isSoldOut && (
                        <div className="absolute inset-y-0 left-0 w-1 bg-orange-500"></div>
                      )}
                    </td>

                    <td className="px-3 py-2.5">
                      <div className="flex flex-col">
                        <span className={`text-white font-bold tracking-wide transition-colors text-xs ${isSoldOut ? 'line-through text-red-400/50' : 'group-hover:text-orange-400'} ${isCatalog ? 'text-blue-100' : ''}`}>
                          {product.name}
                        </span>
                        {product.ean && (
                          <span className="text-[9px] text-gray-500 font-mono mt-0.5 tracking-wider flex items-center gap-1">
                            <span className={`w-1 h-1 rounded-full ${isSoldOut ? 'bg-gray-700' : (isCatalog ? 'bg-blue-400' : 'bg-blue-500')}`}></span>
                            {product.ean}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <span className={`bg-[#0a0202] border border-white/10 px-1.5 py-0.5 rounded text-[10px] font-mono ${isSoldOut ? 'text-gray-600' : (isCatalog ? 'text-blue-300/70 border-blue-500/20' : 'text-gray-300')}`}>
                        {product.batch}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      {isCatalog ? (
                        <span className="text-[10px] text-gray-500 font-mono">-</span>
                      ) : isSoldOut ? (
                        <span className="flex items-center justify-center gap-1 text-red-500 font-black tracking-wider text-[9px] animate-pulse bg-red-500/5 rounded py-0.5 px-2 border border-red-500/20">
                          ESGOTADO
                        </span>
                      ) : (
                        <span className={`text-sm font-bold ${product.quantity < 10 ? 'text-orange-400' : 'text-white'}`}>
                          {product.quantity}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <div className={`flex flex-col items-center ${isSoldOut ? 'opacity-40' : ''}`}>
                        {isCatalog ? (
                          <span className="text-[10px] text-blue-400/50 tracking-widest uppercase">Ref.</span>
                        ) : (
                          <>
                            <span className="text-gray-300 text-[11px]">
                              {new Date(product.expiryDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                            </span>
                            <span className={`text-[9px] font-bold ${product.daysRemaining < 0 ? 'text-red-500' :
                                product.daysRemaining < 30 ? 'text-yellow-500' : 'text-green-500'
                              }`}>
                              {product.daysRemaining} dias
                            </span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border tracking-wider ${isSoldOut ? 'bg-gray-800 border-gray-700 text-gray-500' : getStatusColor(product.status, isCatalog)}`}>
                        {isSoldOut ? <X size={10} className="mr-1" /> : getStatusIcon(product.status, isCatalog)}
                        {isCatalog ? 'Referência' : (isSoldOut ? 'Indisponível' : (product.status === 'safe' ? 'Seguro' :
                          product.status === 'critical' ? 'Crítico' : 'Vencido'))}
                      </span>
                    </td>

                    <td className="px-3 py-2.5 text-center relative">
                      {/* New Elegant Action Buttons Layout */}
                      {/* Modified: Added lg:opacity-0 to ensure visible on mobile, changed hover logic */}
                      <div className={`flex items-center justify-center gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 lg:focus-within:opacity-100 transition-all duration-300`}>

                        {/* Secondary Actions Group (Edit/Share/Delete) */}
                        <div className="flex bg-[#0f0f0f]/90 border border-white/10 rounded-lg p-0.5 shadow-sm backdrop-blur-sm">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onEdit(product); }}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-white/30"
                            title="Editar Detalhes"
                          >
                            <Edit size={14} />
                          </button>
                          <div className="w-px bg-white/10 my-1 mx-0.5"></div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onShare(product); }}
                            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
                            title="Compartilhar"
                          >
                            <Share2 size={14} />
                          </button>
                          <div className="w-px bg-white/10 my-1 mx-0.5"></div>
                          {/* DELETE BUTTON - Functionality Fixed */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDelete(product.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-red-500/30"
                            title="Excluir Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Primary Action - Sell Button (Highlighted) */}
                        {!isCatalog && !isSoldOut && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                            className="
                                        relative group/sell overflow-hidden
                                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                        bg-gradient-to-br from-emerald-500 to-green-600 
                                        hover:from-emerald-400 hover:to-green-500
                                        text-white font-bold text-[10px] tracking-wider uppercase
                                        shadow-[0_4px_12px_rgba(16,185,129,0.3)] 
                                        hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)]
                                        hover:-translate-y-0.5 active:translate-y-0
                                        border-t border-white/20
                                        transition-all duration-300
                                        focus:outline-none focus:ring-2 focus:ring-green-500/50
                                    "
                            title="Realizar Venda"
                          >
                            {/* Shine Effect */}
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover/sell:animate-[shimmer_1s_infinite]"></div>

                            <ShoppingCart size={14} className="stroke-[2.5]" />
                            <span>VENDER</span>
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && onBulkDelete && (
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <div className="bg-[#1a0505] border border-orange-500/30 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] p-1.5 pl-4 flex items-center gap-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center font-bold text-black text-xs shadow-[0_0_15px_rgba(249,115,22,0.5)]">
                {selectedIds.length}
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Selecionados
              </span>
            </div>

            <div className="h-6 w-px bg-white/10"></div>

            <button
              type="button"
              onClick={() => onBulkDelete(selectedIds)}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider shadow-lg shadow-red-900/40 hover:shadow-red-500/20 active:scale-95 transition-all flex items-center gap-2"
            >
              <Trash2 size={14} /> Excluir
            </button>

            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
              title="Cancelar Seleção"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;