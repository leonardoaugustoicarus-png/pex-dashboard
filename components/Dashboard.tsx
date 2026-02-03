import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Download, Upload, Box, AlertCircle,
  Clock, CheckCircle, Monitor, Database, Loader2
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { db } from '../firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  writeBatch
} from 'firebase/firestore';

import Header from './Header';
import StatCard from './StatCard';
import Filters from './Filters';
import ProductTable from './ProductTable';
import NewProductModal from './NewProductModal';
import ShareModal from './ShareModal';
import SaleModal from './SaleModal';
import DeleteModal from './DeleteModal';
import PDFPreviewModal from './PDFPreviewModal';
import Toast, { ToastMessage, ToastType } from './Toast';
import { Product, SaleRecord } from '../types';

interface DashboardProps {
  products: Product[];
  salesHistory: SaleRecord[];
  isLoading: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ products, salesHistory, isLoading }) => {
  const [isMigrating, setIsMigrating] = useState(false);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Ref for file import
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FILTERS STATE ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // New Advanced Filters State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [vendor, setVendor] = useState('');
  const [section, setSection] = useState('');
  const [transfer, setTransfer] = useState('');

  // State for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);

  // NEW: Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [bulkIdsToDelete, setBulkIdsToDelete] = useState<string[]>([]);

  // PDF Preview State
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);
  const [currentPDFTitle, setCurrentPDFTitle] = useState('');

  // Selection State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- TOAST HELPER ---
  const addToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- FIREBASE SYNC & MIGRATION ---

  // --- FIREBASE SYNC & MIGRATION handled in App.tsx ---

  // 3. AUTO MIGRATION: LocalStorage -> Firebase
  // Runs once. If Firebase is empty but LocalStorage has data, migrate it.
  useEffect(() => {
    const checkAndMigrate = async () => {
      if (isMigrating) return;

      const localProducts = localStorage.getItem('pex_products');
      const localSales = localStorage.getItem('pex_sales_history');

      let migratedProducts = false;
      let migratedSales = false;

      if (localProducts && products.length === 0) {
        try {
          const parsedProducts = JSON.parse(localProducts);
          if (Array.isArray(parsedProducts) && parsedProducts.length > 0) {
            setIsMigrating(true);
            addToast("Migração", "Detectados dados locais. Enviando para nuvem...", "info");

            const batch = writeBatch(db);
            let count = 0;

            parsedProducts.forEach((p: Product) => {
              const docRef = doc(collection(db, "inventory"));
              const { id, ...data } = p;
              batch.set(docRef, { ...data, oldId: id });
              count++;
            });

            await batch.commit();
            addToast("Sucesso", `${count} produtos migrados para o Firebase!`, "success");
            localStorage.removeItem('pex_products');
            migratedProducts = true;
          }
        } catch (e) {
          console.error("Erro na migração de produtos:", e);
          addToast("Erro Migração", "Falha ao migrar produtos locais.", "error");
        }
      }

      if (localSales && salesHistory.length === 0) {
        try {
          const parsedSales = JSON.parse(localSales);
          if (Array.isArray(parsedSales) && parsedSales.length > 0) {
            const batch = writeBatch(db);
            parsedSales.forEach((s: SaleRecord) => {
              const docRef = doc(collection(db, "sales"));
              batch.set(docRef, s);
            });
            await batch.commit();
            localStorage.removeItem('pex_sales_history');
            migratedSales = true;
          }
        } catch (e) {
          console.error("Erro na migração de vendas:", e);
        }
      }

      if (migratedProducts || migratedSales) {
        setIsMigrating(false);
      }
    };

    // Only attempt migration if we are not loading and have no products
    if (!isLoading && products.length === 0) {
      const timer = setTimeout(checkAndMigrate, 1500);
      return () => clearTimeout(timer);
    }
  }, [products.length, salesHistory.length, addToast, isLoading, isMigrating]);


  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Pesquisar"]') as HTMLInputElement;
        searchInput?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const calculateProductStatus = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!expiryDateStr) return { diffDays: 0, status: 'safe' as const };

    const [year, month, day] = expiryDateStr.split('-').map(Number);
    const expiryLocal = new Date(year, month - 1, day);
    expiryLocal.setHours(0, 0, 0, 0);

    const diffTime = expiryLocal.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: 'expired' | 'critical' | 'safe' = 'safe';
    if (diffDays < 0) status = 'expired';
    else if (diffDays <= 30) status = 'critical';

    return { diffDays, status };
  };

  // --- ACTIONS HANDLERS (UPDATED FOR FIREBASE) ---

  const handleOpenNewModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData: Omit<Partial<Product>, 'quantity'> & { quantity: string | number }) => {
    if (!formData.expiryDate || !formData.name) {
      addToast("Erro", "Preencha os campos obrigatórios.", "error");
      return;
    }

    const { diffDays, status } = calculateProductStatus(formData.expiryDate);
    const parsedQuantity = parseInt(String(formData.quantity)) || 0;

    const safeName = formData.name.toUpperCase().trim();
    const safeBatch = (formData.batch || '').toUpperCase().trim();
    const safeSection = (formData.section || '').toUpperCase().trim();
    const safeTransfer = (formData.transfer || '').toUpperCase().trim();
    const safeRegistration = (formData.registration || '').toUpperCase().trim();
    const safeEan = (formData.ean || '').trim();

    const productData = {
      name: safeName,
      batch: safeBatch,
      quantity: parsedQuantity,
      expiryDate: formData.expiryDate,
      daysRemaining: diffDays,
      status,
      ean: safeEan,
      registration: safeRegistration,
      section: safeSection,
      transfer: safeTransfer,
      notes: formData.notes || ''
    };

    try {
      if (editingProduct) {
        // Update existing in Firestore
        const productRef = doc(db, "inventory", editingProduct.id);
        await updateDoc(productRef, productData);
        addToast("Sucesso", "Produto atualizado na nuvem!", "success");
      } else {
        // Create new in Firestore
        await addDoc(collection(db, "inventory"), productData);

        // Check Catalog Logic
        let shouldAddToCatalog = false;
        if (safeEan) {
          const catalogExists = products.some(p =>
            p.batch === 'CATÁLOGO' && p.ean === safeEan
          );
          if (!catalogExists) {
            shouldAddToCatalog = true;
          }
        }

        if (shouldAddToCatalog) {
          const catalogData = {
            ...productData,
            batch: 'CATÁLOGO',
            quantity: 0,
            status: 'safe',
            daysRemaining: 999
          };
          await addDoc(collection(db, "inventory"), catalogData);
          addToast("Catálogo", "Item registrado automaticamente.", "info");
        }
        addToast("Salvo", `${safeName} gravado no banco de dados.`, "success");
      }
    } catch (error) {
      console.error("Error saving document: ", error);
      addToast("Erro", "Falha ao salvar dados no Firestore.", "error");
    }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteRequest = (id: string) => {
    const product = products.find(p => p.id === id);
    if (product) {
      setProductToDelete(product);
      setBulkIdsToDelete([]);
      setIsDeleteModalOpen(true);
    }
  };

  const handleBulkDelete = (ids: string[]) => {
    setBulkIdsToDelete(ids);
    setProductToDelete(null);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (productToDelete) {
        await deleteDoc(doc(db, "inventory", productToDelete.id));
        addToast("Removido", "Produto excluído da nuvem.", "warning");
        setProductToDelete(null);
      } else if (bulkIdsToDelete.length > 0) {
        const batch = writeBatch(db);
        bulkIdsToDelete.forEach(id => {
          batch.delete(doc(db, "inventory", id));
        });
        await batch.commit();
        addToast("Exclusão em Massa", `${bulkIdsToDelete.length} itens removidos.`, "warning");
        setBulkIdsToDelete([]);
      }
    } catch (error) {
      console.error("Error deleting: ", error);
      addToast("Erro", "Falha ao excluir itens do Firestore.", "error");
    }
  };

  const handleShareProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsShareModalOpen(true);
  };

  const handleInitiateSale = (product: Product) => {
    setSelectedProduct(product);
    setIsSaleModalOpen(true);
  };

  const handleConfirmSale = async (matricula: string, quantitySold: number, _batchSold: string) => {
    if (selectedProduct) {
      setIsSaleModalOpen(false);

      try {
        const batch = writeBatch(db);

        // 1. Add to Sales Collection
        const saleRef = doc(collection(db, "sales"));
        const saleData = {
          ...selectedProduct,
          id: saleRef.id, // Explicit ID for record
          quantitySold: quantitySold,
          sellerId: matricula,
          saleDate: new Date().toISOString()
        };
        batch.set(saleRef, saleData);

        // 2. Update Inventory
        const remaining = selectedProduct.quantity - quantitySold;
        const isSoldOut = remaining <= 0;
        const productRef = doc(db, "inventory", selectedProduct.id);

        // Update quantity
        batch.update(productRef, { quantity: isSoldOut ? 0 : remaining });

        await batch.commit();

        if (isSoldOut) {
          addToast("Esgotado", `Produto esgotado por: ${matricula}`, "warning");
          // Optional: Cleanup
          // await deleteDoc(productRef); 
        } else {
          addToast("Venda", "Venda registrada com sucesso.", "success");
        }

        setSelectedProduct(null);

      } catch (error) {
        console.error("Error processing sale: ", error);
        addToast("Erro", "Falha ao processar venda no banco.", "error");
      }
    }
  };

  // --- BACKUP FUNCTIONS (EXPORT ONLY NOW) ---

  const handleExportBackup = () => {
    if (products.length === 0) {
      addToast("Atenção", "Não há dados para exportar.", "warning");
      return;
    }
    const dataStr = JSON.stringify({ products, salesHistory }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pex_cloud_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Download", "Backup da nuvem exportado.", "success");
  };

  // Import now parses JSON and pushes to Firebase
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Isso adicionará os itens do arquivo ao banco de dados atual. Continuar?")) {
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        let newProducts = [];

        if (Array.isArray(importedData)) {
          newProducts = importedData;
        } else if (importedData.products) {
          newProducts = importedData.products;
        }

        if (Array.isArray(newProducts) && newProducts.length > 0) {
          const batch = writeBatch(db);
          let count = 0;

          newProducts.forEach((p: any) => {
            const { diffDays, status } = calculateProductStatus(p.expiryDate);
            const docRef = doc(collection(db, "inventory"));
            const { id, ...data } = p; // Strip local ID
            batch.set(docRef, { ...data, daysRemaining: diffDays, status });
            count++;
          });

          await batch.commit();
          addToast("Importação", `${count} produtos enviados para a nuvem.`, "success");
        } else {
          addToast("Erro", "Arquivo vazio ou inválido.", "error");
        }
      } catch (error) {
        console.error("Erro ao importar:", error);
        addToast("Erro", "Falha ao processar arquivo.", "error");
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Statistics Calculation
  const inventoryProducts = products.filter(p => p.batch !== 'CATÁLOGO');

  const stats = {
    total: inventoryProducts.length,
    expired: inventoryProducts.filter(p => p.status === 'expired').length,
    critical: inventoryProducts.filter(p => p.status === 'critical').length,
    safe: inventoryProducts.filter(p => p.status === 'safe').length,
  };

  // --- FILTER LOGIC ---
  let baseProductList = products;

  if (statusFilter === 'catalog') {
    baseProductList = products.filter(p => p.batch === 'CATÁLOGO');
  } else {
    baseProductList = products.filter(p => p.batch !== 'CATÁLOGO');
  }

  const filteredProducts = baseProductList.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(term) ||
      p.batch.toLowerCase().includes(term) ||
      (p.ean && p.ean.includes(term));
    if (!matchesSearch) return false;

    if (statusFilter !== 'all' && statusFilter !== 'catalog') {
      if (statusFilter === 'expired' && p.status !== 'expired') return false;
      if (statusFilter === 'critical' && p.status !== 'critical') return false;
      if (statusFilter === 'safe' && p.status !== 'safe') return false;
    }

    if (startDate && p.expiryDate < startDate) return false;
    if (endDate && p.expiryDate > endDate) return false;

    if (vendor && !(p.registration || '').includes(vendor.toUpperCase())) return false;
    if (section && !(p.section || '').includes(section.toUpperCase())) return false;
    if (transfer && !(p.transfer || '').includes(transfer.toUpperCase())) return false;

    return true;
  });

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStartDate('');
    setEndDate('');
    setVendor('');
    setSection('');
    setTransfer('');
    addToast("Filtros", "Filtros limpos.", "info");
  };

  const handleClearSales = async () => {
    if (!confirm("Tem certeza que deseja apagar todo o histórico de vendas do banco de dados?")) return;

    try {
      const batch = writeBatch(db);
      salesHistory.forEach(sale => {
        batch.delete(doc(db, "sales", sale.id));
      });
      await batch.commit();
      addToast("Banco de Dados", "Histórico de vendas apagado.", "warning");
    } catch (e) {
      console.error(e);
      addToast("Erro", "Falha ao limpar histórico.", "error");
    }
  };

  const generatePDF = (title: string, theme: 'blue' | 'slate' | 'green' | 'red' = 'red', customData?: Product[]) => {
    const isSalesReport = title.toLowerCase().includes('vendas');
    const isCatalogReport = title.toLowerCase().includes('catálogo');

    const dataToPrint = customData || (isSalesReport ? salesHistory : filteredProducts);

    if (dataToPrint.length === 0) {
      addToast("Vazio", "Nenhum dado para o relatório.", "warning");
      return;
    }

    addToast("PDF", "Gerando documento...", "info");
    const doc = new jsPDF();

    let headerColor: [number, number, number] = [61, 14, 14];
    if (theme === 'blue') headerColor = [37, 99, 235];
    if (theme === 'slate') headerColor = [30, 41, 59];
    if (theme === 'green') headerColor = [22, 163, 74];

    doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`PEX - ${title.toUpperCase()}`, 105, 18, { align: 'center' });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(220, 220, 220);
    doc.text("CLOUD DATABASE SYSTEM", 105, 24, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(`GERADO EM: ${new Date().toLocaleString('pt-BR')}`, 105, 33, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    let tableColumn = [];
    let tableRows = [];

    if (isSalesReport) {
      doc.text(`Total de Registros: ${salesHistory.length}`, 14, 50);
      tableColumn = ["Data", "Vendedor", "Produto", "Lote", "Qtd"];
      const sortedSales = [...(dataToPrint as SaleRecord[])].sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      tableRows = sortedSales.map(s => [
        new Date(s.saleDate).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
        s.sellerId,
        s.name,
        s.batch,
        s.quantitySold
      ]);
    } else if (isCatalogReport) {
      doc.text(`Total no Catálogo: ${dataToPrint.length}`, 14, 50);
      tableColumn = ["EAN", "Produto", "Lote", "Seção", "Matrícula"];
      tableRows = (dataToPrint as Product[]).map(p => [
        p.ean || 'N/A',
        p.name,
        p.batch,
        p.section || '-',
        p.registration || '-'
      ]);
    } else {
      doc.text(`Total de produtos: ${dataToPrint.length}`, 14, 50);
      tableColumn = ["EAN", "Produto", "Lote", "Qtd", "Validade", "Status"];
      tableRows = (dataToPrint as Product[]).map((p) => {
        const dateObj = new Date(p.expiryDate);
        const dateStr = !isNaN(dateObj.getTime()) ? dateObj.toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-';
        return [
          p.ean || 'N/A',
          p.name,
          p.batch,
          p.quantity,
          dateStr,
          p.status === 'expired' ? 'VENCIDO' : p.status === 'critical' ? 'CRÍTICO' : 'SEGURO'
        ]
      });
    }

    autoTable(doc, {
      startY: 55,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: headerColor, textColor: 255, fontStyle: 'bold', halign: 'center', valign: 'middle' },
      styles: { fontSize: 9, cellPadding: 3, valign: 'middle' },
      alternateRowStyles: { fillColor: [240, 242, 245] }
    });

    const pdfBlobUrl = doc.output('bloburl');
    setPdfPreviewUrl(pdfBlobUrl.toString());
    setCurrentPDFTitle(title);
    setIsPDFModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#180404] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a0a0a] via-[#1f0505] to-[#0f0202] text-white font-sans flex flex-col relative overflow-x-hidden">
      <Header expiredCount={stats.expired} />

      {/* Toast Container */}
      <div className="fixed top-24 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        <div className="pointer-events-auto">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={removeToast} />
          ))}
        </div>
      </div>

      <PDFPreviewModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        pdfUrl={pdfPreviewUrl}
        title={currentPDFTitle}
      />

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      {/* --- MODALS --- */}
      <NewProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        productToEdit={editingProduct}
        catalogReference={products}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        product={selectedProduct}
      />
      <SaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onConfirm={handleConfirmSale}
        product={selectedProduct}
      />
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        productName={productToDelete?.name}
        count={bulkIdsToDelete.length > 0 ? bulkIdsToDelete.length : 1}
      />

      <main className="flex-1 p-4 md:p-6 max-w-[1300px] mx-auto space-y-5 pb-32 w-full">

        {/* Dashboard Title & Quick Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3 border-b border-white/5 pb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Database size={26} className="text-orange-500 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-black text-white tracking-tighter drop-shadow-[2px_2px_0_#2563eb]">
                DASHBOARD CLOUD
              </h2>
            </div>
            <p className="text-orange-400/60 text-[10px] tracking-[0.4em] font-bold uppercase pl-1 border-l-4 border-orange-600 ml-1">
              CONECTADO AO FIREBASE
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportBackup}
              className="p-2.5 bg-[#2c0a0a] rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/50 hover:bg-[#3d0e0e] transition-all shadow-lg hover:shadow-orange-500/10 active:scale-95"
              title="Exportar Backup da Nuvem"
            >
              <Download size={18} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2.5 bg-[#2c0a0a] rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-orange-500/50 hover:bg-[#3d0e0e] transition-all shadow-lg hover:shadow-orange-500/10 active:scale-95"
              title="Importar Arquivo para Nuvem"
            >
              <Upload size={18} />
            </button>
          </div>
        </div>

        {/* Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Ativos"
            count={stats.total}
            label="ITENS NA NUVEM"
            icon={Box}
            variant="orange"
            isActive={statusFilter === 'all'}
            onClick={() => setStatusFilter('all')}
          />
          <StatCard
            title="Vencidos"
            count={stats.expired}
            label="ITENS"
            icon={AlertCircle}
            variant="red"
            isActive={statusFilter === 'expired'}
            onClick={() => setStatusFilter('expired')}
          />
          <StatCard
            title="Críticos"
            count={stats.critical}
            label="ITENS"
            icon={Clock}
            variant="yellow"
            isActive={statusFilter === 'critical'}
            onClick={() => setStatusFilter('critical')}
          />
          <StatCard
            title="Seguros"
            count={stats.safe}
            label="ITENS"
            icon={CheckCircle}
            variant="green"
            isActive={statusFilter === 'safe'}
            onClick={() => setStatusFilter('safe')}
          />
        </div>

        <div>
          <div className="mb-4">
            <Filters
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              startDate={startDate}
              onStartDateChange={setStartDate}
              endDate={endDate}
              onEndDateChange={setEndDate}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              vendor={vendor}
              onVendorChange={setVendor}
              section={section}
              onSectionChange={setSection}
              transfer={transfer}
              onTransferChange={setTransfer}
              onNewProduct={handleOpenNewModal}
              onGenerateCatalog={() => generatePDF('Catálogo de Produtos', 'blue', products.filter(p => p.batch === 'CATÁLOGO'))}
              onGenerateInventory={() => generatePDF('Relatório de Inventário', 'slate', filteredProducts)}
              onGenerateSales={() => generatePDF('Relatório de Vendas', 'green')}
              onClearFilters={handleClearFilters}
              onClearSales={handleClearSales}
            />
          </div>
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-24 bg-[#150505]/40 rounded-2xl border border-white/5 animate-pulse">
              <Loader2 size={40} className="text-orange-500 animate-spin mb-4" />
              <span className="text-orange-200 text-sm font-bold tracking-widest uppercase">Sincronizando Banco de Dados...</span>
              <span className="text-orange-500/40 text-[10px] font-mono mt-1">Lendo coleção 'inventory' e 'sales'</span>
            </div>
          ) : (
            <ProductTable
              products={filteredProducts}
              onDelete={handleDeleteRequest}
              onBulkDelete={handleBulkDelete}
              onEdit={handleEditProduct}
              onShare={handleShareProduct}
              onAddToCart={handleInitiateSale}
            />
          )}
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-[#150505]/90 backdrop-blur-md border-t border-white/5 px-6 py-2 flex justify-between items-center text-[9px] font-bold tracking-widest uppercase z-40 shadow-[0_-5px_25px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2 text-orange-500/80 bg-orange-500/5 px-2 py-0.5 rounded-full border border-orange-500/10">
          <Monitor size={12} />
          <span>TERMINAL ATIVO</span>
        </div>
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500 group cursor-default">
          <span className="group-hover:text-gray-300 transition-colors">DESENVOLVIDO POR</span>
          <div className="relative">
            <img
              src="https://i.postimg.cc/rsmjz3j9/Águia_Branca.png"
              alt="Águia Branca"
              className="h-8 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.2)] transition-all group-hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)] group-hover:scale-105"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 text-green-500 bg-green-500/5 px-2 py-0.5 rounded-full border border-green-500/10">
          <div className={`w-1.5 h-1.5 bg-green-500 rounded-full ${!isLoading ? 'animate-pulse' : ''} shadow-[0_0_8px_rgba(34,197,94,0.6)]`}></div>
          {isLoading ? 'CONECTANDO...' : 'ONLINE (FIREBASE)'}
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;