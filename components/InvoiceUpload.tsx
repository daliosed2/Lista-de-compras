import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, Check, Loader2, PlusCircle, FileType } from 'lucide-react';
import { parseInvoiceWithAI } from '../services/geminiService';
import { InvoiceItem } from '../types';

interface InvoiceUploadProps {
    onUpdatePrices: (newItems: InvoiceItem[]) => void;
}

const InvoiceUpload: React.FC<InvoiceUploadProps> = ({ onUpdatePrices }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [extractedItems, setExtractedItems] = useState<InvoiceItem[]>([]);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview logic
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setFileType(file.type);
        setExtractedItems([]); // Limpiar anteriores

        setIsLoading(true);
        try {
            const items = await parseInvoiceWithAI(file);
            setExtractedItems(items);
        } catch (error) {
            console.error(error);
            alert("Error al leer el documento. Intenta con un archivo más claro.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyPrices = () => {
        onUpdatePrices(extractedItems);
        setExtractedItems([]);
        setPreviewUrl(null);
        setFileType(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                        <Camera size={20} />
                    </span>
                    Escanear Factura
                </h2>
                
                <p className="text-sm text-gray-600 mb-6">
                    Sube una foto o PDF de una factura antigua. La IA extraerá los precios y actualizará tu base de datos local para que tus futuros cálculos sean más exactos.
                </p>

                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                    />
                    
                    {previewUrl ? (
                        <div className="relative w-full max-w-xs h-48 rounded-lg overflow-hidden shadow-md bg-gray-200 flex items-center justify-center">
                            {fileType === 'application/pdf' ? (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <FileType size={48} className="mb-2 text-red-500" />
                                    <span className="font-semibold text-sm">Documento PDF</span>
                                </div>
                            ) : (
                                <img src={previewUrl} alt="Factura Preview" className="w-full h-full object-cover" />
                            )}
                            
                            {isLoading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                                    <div className="text-white flex flex-col items-center gap-2">
                                        <Loader2 className="animate-spin" size={32} />
                                        <span className="text-sm font-medium">Analizando documento...</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center">
                            <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                            <p className="text-sm font-medium text-gray-700">Haz clic para subir</p>
                            <p className="text-xs text-gray-500 mt-1">Soporta JPG, PNG y PDF</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Resultados de la extracción */}
            {extractedItems.length > 0 && (
                <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-medium flex items-center gap-2">
                            <FileText size={18} />
                            Precios Detectados ({extractedItems.length})
                        </h3>
                    </div>

                    <div className="max-h-64 overflow-y-auto mb-6 pr-2 custom-scrollbar">
                        <table className="w-full text-left text-sm text-gray-300">
                            <thead className="text-xs text-gray-500 uppercase border-b border-gray-700 sticky top-0 bg-gray-800">
                                <tr>
                                    <th className="py-2">Producto</th>
                                    <th className="py-2 text-right">Precio</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {extractedItems.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="py-2 font-medium text-white">{item.product_name}</td>
                                        <td className="py-2 text-right text-green-400 font-mono">${item.price.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        onClick={handleApplyPrices}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg"
                    >
                        <PlusCircle size={20} />
                        Actualizar Base de Precios
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-2">
                        Estos precios se usarán en tus próximos cálculos de lista.
                    </p>
                </div>
            )}
        </div>
    );
};

export default InvoiceUpload;