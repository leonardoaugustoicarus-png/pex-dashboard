import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Filter, FileText, List, ShoppingCart, Trash2,
  ChevronDown, ChevronUp, Tag, User, Calendar, LayoutGrid, ArrowRightLeft,
  Box, AlertTriangle, Clock, CheckCircle, Eraser, AlertCircle, Check,
  ArrowDownAZ, ArrowUpAZ, ArrowUpDown
} from 'lucide-react';

interface FiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;

  // Advanced filters
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  vendor: string;
  onVendorChange: (val: string) => void;
  section: string;
  onSectionChange: (val: string) => void;

  // New prop for Transfer logic
  transfer?: string;
  onTransferChange?: (val: string) => void;

  // Action Handlers
  onNewProduct: () => void;
  onGenerateCatalog: () => void;
  onGenerateInventory: () => void;
  onGenerateSales: () => void;
  onClearFilters: () => void;
  onClearSales: () => void;
  // Sorting props
  sortOrder: 'default' | 'asc' | 'desc';
  onSortChange: (val: 'default' | 'asc' | 'desc') => void;
}

const Filters: React.FC<FiltersProps> = ({
  searchTerm, onSearchChange,
  startDate, onStartDateChange,
  endDate, onEndDateChange,
  statusFilter, onStatusFilterChange,
  vendor, onVendorChange,
  section, onSectionChange,
  transfer = '',
  onTransferChange,
  onNewProduct,
  onGenerateCatalog,
  onGenerateInventory,
  onGenerateSales,
  onClearFilters,
  onClearSales,
  sortOrder,
  onSortChange
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // State to manage overflow visibility for dropdowns
  const [overflowVisible, setOverflowVisible] = useState(true);

  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // New state for Clear Sales Confirmation
  const [isClearSalesOpen, setIsClearSalesOpen] = useState(false);
  const clearSalesRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Status Dropdown Logic
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusDropdownOpen(false);
      }

      // Clear Sales Dropdown Logic
      if (clearSalesRef.current && !clearSalesRef.current.contains(event.target as Node)) {
        setIsClearSalesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Overflow transition to prevent dropdown clipping
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isExpanded) {
      // Wait for transition to finish (500ms) before allowing overflow
      timer = setTimeout(() => setOverflowVisible(true), 500);
    } else {
      // Immediately hide overflow when collapsing
      setOverflowVisible(false);
    }
    return () => clearTimeout(timer);
  }, [isExpanded]);

  const inputBaseClass = "w-full bg-[#200505] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 transition-all font-medium h-[46px]";
  const labelBaseClass = "text-[10px] font-bold text-red-400/80 uppercase tracking-widest mb-3 flex items-center gap-2";
  const groupBaseClass = "bg-[#450a0a]/30 border border-white/5 rounded-2xl p-5 flex flex-col justify-center relative backdrop-blur-sm hover:bg-[#450a0a]/50 transition-colors duration-300";

  // Common button class for 3D effect
  const button3DClass = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all active:translate-y-1 active:shadow-none shadow-md border-b-4 hover:-translate-y-0.5 whitespace-nowrap";

  // Mapping for custom dropdown
  const statusOptions = [
    { value: 'all', label: 'Inventário Ativo', icon: Box, color: 'text-gray-200' },
    { value: 'catalog', label: 'Catálogo de Produtos', icon: FileText, color: 'text-blue-300' },
    { value: 'expired', label: 'Somente Vencidos', icon: AlertTriangle, color: 'text-red-400' },
    { value: 'critical', label: 'Somente Críticos', icon: Clock, color: 'text-yellow-400' },
    { value: 'safe', label: 'Somente Seguros', icon: CheckCircle, color: 'text-green-400' },
  ];

  const currentStatusOption = statusOptions.find(opt => opt.value === statusFilter) || statusOptions[0];

  const handleSortToggle = () => {
    if (sortOrder === 'default') onSortChange('asc');
    else if (sortOrder === 'asc') onSortChange('desc');
    else onSortChange('default');
  };

  return (
    <div className="flex flex-col gap-5 mb-8">
      {/* Top Row: Search, Toggle, Actions */}
      <div className="bg-[#450a0a]/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-5 shadow-2xl relative z-30">

        <div className="flex w-full lg:w-auto gap-3 items-center flex-1">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[200px] group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-red-500 transition-colors" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Pesquisar por nome, lote ou código de barras..."
              className="w-full bg-[#2a0505] border border-white/10 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-red-500/50 focus:ring-2 focus:ring-red-500/10 text-gray-200 placeholder-gray-600 transition-all shadow-inner font-medium h-[42px]"
            />
          </div>

          {/* Sort Button Style Update - Helper function or inline check */}
          <button
            onClick={handleSortToggle}
            className={`
                hidden sm:flex items-center gap-2 px-4 h-[42px] rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 border border-white/5
                ${sortOrder !== 'default'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                : 'bg-[#450a0a] hover:bg-[#7f1d1d] text-gray-400 hover:text-white'}
              `}
            title="Ordenar por Nome"
          >
            {sortOrder === 'asc' ? <ArrowDownAZ size={16} /> : sortOrder === 'desc' ? <ArrowUpAZ size={16} /> : <ArrowUpDown size={16} />}
            <span className="hidden md:inline">{sortOrder === 'asc' ? 'A-Z' : sortOrder === 'desc' ? 'Z-A' : 'ORDENAR'}</span>
          </button>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
                hidden sm:flex items-center gap-2 px-6 h-[42px] rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 border border-white/5
                ${isExpanded
                ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]'
                : 'bg-[#450a0a] hover:bg-[#7f1d1d] text-gray-400 hover:text-white'}
            `}
          >
            <Filter size={16} />
            <span>Filtros</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {/* Mobile Toggle Icon Only */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="sm:hidden p-3.5 bg-orange-600 rounded-xl text-white h-[42px] w-[42px] flex items-center justify-center"
          >
            <Filter size={20} />
          </button>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 hide-scrollbar">

          {/* New Product Button - Integrated here */}
          <button
            onClick={onNewProduct}
            className="group relative flex items-center gap-2 px-5 h-[42px] rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-br from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-[#2c0a0a] shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all hover:-translate-y-0.5 active:scale-95 border border-white/20 overflow-hidden whitespace-nowrap"
          >
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 group-hover:animate-[shimmer_1s_infinite]"></div>
            <Box size={16} className="stroke-[2.5]" /> NOVO PRODUTO
          </button>

          <div className="w-px h-8 bg-white/10 mx-1"></div>

          <button
            onClick={onGenerateCatalog}
            className={`${button3DClass} min-w-[120px] bg-[#1e1b4b] hover:bg-[#2e2a5b] text-blue-200 border-blue-900/50 hover:border-blue-700/50 shadow-[0_0_15px_rgba(30,58,138,0.2)]`}
            title="Gerar PDF do Catálogo de Referência"
          >
            <FileText size={16} /> CATÁLOGO
          </button>

          <button
            onClick={onGenerateInventory}
            className={`${button3DClass} min-w-[120px] bg-[#450a0a] hover:bg-[#7f1d1d] text-gray-200 border-white/10 hover:border-white/20`}
            title="Gerar PDF da Lista Atual"
          >
            <List size={16} /> INVENTÁRIO
          </button>

          {/* Vendas Group */}
          <div className="relative flex items-center rounded-xl shadow-lg shadow-green-900/20" ref={clearSalesRef}>
            <button
              onClick={onGenerateSales}
              className={`flex items-center gap-2 px-6 py-3 rounded-l-lg text-xs font-bold uppercase tracking-wider bg-green-700 hover:bg-green-600 text-white border-b-4 border-green-900 active:border-b-0 active:translate-y-1 transition-all z-10 whitespace-nowrap`}
            >
              <ShoppingCart size={16} /> VENDAS
            </button>

            <button
              onClick={() => setIsClearSalesOpen(!isClearSalesOpen)}
              className={`px-4 py-3 bg-red-700 hover:bg-red-600 text-white rounded-r-lg border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center group ${isClearSalesOpen ? 'bg-red-600 border-t-0 border-x-0 translate-y-1 border-b-0' : ''}`}
              title="Limpar Relatório"
            >
              <Trash2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>

            {/* Confirmation Dropdown */}
            {isClearSalesOpen && (
              <div className="absolute right-0 top-full mt-3 w-80 bg-[#1a0505] border border-red-500/20 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-red-900/20 p-4 border-b border-red-500/10 flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <AlertCircle size={20} className="text-red-500" />
                  </div>
                  <span className="text-xs font-bold text-red-200 uppercase tracking-widest">Confirmação</span>
                </div>
                <div className="p-5">
                  <h4 className="text-white font-bold text-sm mb-2">Limpar Relatório de Vendas?</h4>
                  <p className="text-xs text-gray-400 mb-5 leading-relaxed">
                    Essa ação removerá <strong>todos</strong> os itens da lista de vendas atual. Isso não pode ser desfeito.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsClearSalesOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-white/10 bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10 hover:text-white transition"
                    >
                      CANCELAR
                    </button>
                    <button
                      onClick={() => { onClearSales(); setIsClearSalesOpen(false); }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-900/40 transition"
                    >
                      CONFIRMAR
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Expandable Advanced Filters Panel */}
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'} ${overflowVisible ? 'overflow-visible' : 'overflow-hidden'}`}>
        <div className="bg-[#1f0505]/80 backdrop-blur-sm border border-white/5 rounded-3xl p-6 shadow-inner relative z-20">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Status & Category */}
            <div className={groupBaseClass} ref={statusDropdownRef}>
              <label className={labelBaseClass}>
                <Tag size={14} className="text-orange-500" /> Status e Categoria
              </label>

              <div className="relative">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className={`w-full bg-[#0a0202] border rounded-xl px-4 text-sm font-semibold flex items-center justify-between transition-all shadow-sm h-[46px]
                    ${isStatusDropdownOpen ? 'border-orange-500/50 ring-2 ring-orange-500/10 text-white' : 'border-white/10 text-gray-300 hover:border-white/20 hover:text-white'}
                  `}
                >
                  <span className="flex items-center gap-2.5">
                    {React.createElement(currentStatusOption.icon, { size: 16, className: isStatusDropdownOpen ? 'text-orange-500' : currentStatusOption.color.replace('text-', 'text-opacity-80 ') })}
                    {currentStatusOption.label}
                  </span>
                  <ChevronDown size={16} className={`text-gray-500 transition-transform duration-200 ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-[#2a0505] border border-white/10 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 overflow-hidden text-sm animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/5">
                    {statusOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onStatusFilterChange(option.value);
                          setIsStatusDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3.5 flex items-center gap-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 
                          ${statusFilter === option.value ? 'bg-orange-500/10 text-orange-200 font-bold' : 'text-gray-400'}
                        `}
                      >
                        <option.icon size={16} className={statusFilter === option.value ? 'text-orange-500' : option.color} />
                        <span>{option.label}</span>
                        {statusFilter === option.value && <Check size={14} className="ml-auto text-orange-500" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column 2: Location & Vendor */}
            <div className={groupBaseClass}>
              <label className={labelBaseClass}>
                <User size={14} className="text-blue-400" /> Localização e Vendedor
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => onVendorChange(e.target.value)}
                    placeholder="Vendedor (Matrícula)"
                    className={`${inputBaseClass} pl-10`}
                  />
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <LayoutGrid size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={section}
                      onChange={(e) => onSectionChange(e.target.value)}
                      placeholder="SEÇÃO"
                      className={`${inputBaseClass} pl-10 uppercase placeholder:normal-case`}
                    />
                  </div>
                  <div className="relative flex-1">
                    <ArrowRightLeft size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={transfer}
                      onChange={(e) => onTransferChange && onTransferChange(e.target.value)}
                      placeholder="TRANSFER."
                      className={`${inputBaseClass} pl-10 uppercase placeholder:normal-case`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Date Range */}
            <div className={groupBaseClass}>
              <label className={labelBaseClass}>
                <Calendar size={14} className="text-green-500" /> Período de Validade
              </label>
              <div className="flex items-center gap-3 mt-1">
                <div className="relative flex-1 group">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className={`${inputBaseClass} [color-scheme:dark] text-xs`}
                  />
                </div>
                <span className="text-gray-600 font-bold">ATÉ</span>
                <div className="relative flex-1 group">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className={`${inputBaseClass} [color-scheme:dark] text-xs`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Reset Button Section - Compact Icon */}
          <div className="absolute top-6 right-6">
            <button
              onClick={onClearFilters}
              className="p-3 bg-[#2a0505] hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/30 group shadow-lg"
              title="Limpar Todos os Filtros"
            >
              <Eraser size={18} className="group-hover:rotate-12 transition-transform" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Filters;