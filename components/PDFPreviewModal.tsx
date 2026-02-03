import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';

interface PDFPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    pdfUrl: string | null;
    title: string;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ isOpen, onClose, pdfUrl, title }) => {
    if (!isOpen || !pdfUrl) return null;

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-2 md:p-8 animate-in fade-in duration-300">
            <div className="bg-[#111] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(37,99,235,0.2)] w-full h-full max-w-6xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="bg-[#1e1e2e] p-4 flex justify-between items-center border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <FileText className="text-blue-500" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white leading-none">{title}</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Visualização de Relatório</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDownload}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all transform active:scale-95 shadow-lg shadow-blue-900/40"
                        >
                            <Download size={16} /> DOWNLOAD PDF
                        </button>

                        <a
                            href={pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"
                            title="Abrir em Nova Aba"
                        >
                            <ExternalLink size={20} />
                        </a>

                        <div className="w-px h-6 bg-white/10 mx-1"></div>

                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-all hover:bg-red-500/20 p-2 rounded-lg group"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 bg-[#1a1a1a] relative">
                    <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        className="w-full h-full border-none"
                        title="PDF Preview"
                    />
                </div>

                {/* Mobile Footer (Download only visible here on small screens) */}
                <div className="md:hidden p-4 bg-[#0a0a0a] border-t border-white/5">
                    <button
                        onClick={handleDownload}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-900/40"
                    >
                        <Download size={18} /> BAIXAR RELATÓRIO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PDFPreviewModal;
