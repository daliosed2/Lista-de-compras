import React from 'react';
import { EnrichedItem, BudgetSummary } from '../types';
import { Tag, ShoppingCart, Download, FileDown } from 'lucide-react';
import { generateShoppingListPDF } from '../services/pdfService';

interface ResultsTableProps {
    items: EnrichedItem[];
    // Pasamos el summary opcionalmente para usarlo en el PDF si se requiere, 
    // aunque en este componente principalmente mostramos la tabla.
    // Para simplificar, asumimos que calculateBudget se puede re-calcular o pasar.
    // Una mejora sería pasar el objeto budget completo a este componente.
}

const ResultsTable: React.FC<ResultsTableProps> = ({ items }) => {
    if (items.length === 0) return null;

    // Calculamos totales rápidos para el PDF si no se pasan por props (o reusamos la lógica)
    const handleDownloadPDF = () => {
        // Recalcular budget simple para el reporte
        const summary: BudgetSummary = items.reduce((acc, item) => ({
            total_min: acc.total_min + item.total_min,
            total_avg: acc.total_avg + item.total_avg,
            total_max: acc.total_max + item.total_max,
            items_count: acc.items_count + item.quantity,
            savings_potential: 0 // Se recalcula abajo
        }), { total_min: 0, total_avg: 0, total_max: 0, items_count: 0, savings_potential: 0 });
        
        summary.savings_potential = summary.total_avg - summary.total_min;

        generateShoppingListPDF(items, summary);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                        <ShoppingCart size={18} />
                        Detalle de Productos
                    </h3>
                    <span className="text-xs font-medium bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        {items.length} items
                    </span>
                </div>

                <button 
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-green-700 hover:border-green-300 transition-all shadow-sm"
                >
                    <FileDown size={16} />
                    Exportar PDF
                </button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
                        <tr>
                            <th className="px-4 py-3">Producto</th>
                            <th className="px-4 py-3">Cant.</th>
                            <th className="px-4 py-3">Marca / Detalles</th>
                            <th className="px-4 py-3 text-right">Precio Prom.</th>
                            <th className="px-4 py-3 text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.map((item, idx) => (
                            <tr key={idx} className="hover:bg-green-50/30 transition-colors">
                                <td className="px-4 py-3 align-top">
                                    <div className="font-medium text-gray-800">{item.normalized_name}</div>
                                    <div className="text-xs text-gray-400 italic">"{item.raw_text}"</div>
                                </td>
                                <td className="px-4 py-3 text-gray-700 align-top font-semibold">
                                    {item.quantity}
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <div className="flex flex-col gap-1">
                                        {item.brand && (
                                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md w-fit">
                                                {item.brand}
                                            </span>
                                        )}
                                        {item.unit_size && (
                                            <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                                <Tag size={12} /> {item.unit_size}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-400">{item.category}</span>
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-right text-gray-600 align-top">
                                    ${item.price_info.avg.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 text-right font-medium text-gray-800 align-top">
                                    ${item.total_avg.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ResultsTable;