import React, { useState } from 'react';
import { PriceInfo } from '../types';
import { Search, Database, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';

interface PriceListProps {
    priceDb: Record<string, PriceInfo>;
}

const PriceList: React.FC<PriceListProps> = ({ priceDb }) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Convertir objeto DB a array para poder filtrar y mapear
    const products = (Object.entries(priceDb) as [string, PriceInfo][])
        .map(([name, info]) => ({ name, ...info }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                            <span className="bg-purple-100 text-purple-600 p-1.5 rounded-lg">
                                <Database size={20} />
                            </span>
                            Catálogo de Precios
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Base de conocimiento acumulada ({products.length} productos)
                        </p>
                    </div>
                    
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-100">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500 font-medium uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3">Producto Normalizado</th>
                                <th className="px-4 py-3 text-right text-green-600">Mínimo</th>
                                <th className="px-4 py-3 text-right text-blue-600">Promedio</th>
                                <th className="px-4 py-3 text-right text-red-600">Máximo</th>
                                <th className="px-4 py-3 text-center">Fuente</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {filteredProducts.length > 0 ? (
                                filteredProducts.map((product, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-800 capitalize">
                                            {product.name}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-green-700">
                                            <div className="flex items-center justify-end gap-1">
                                                <ArrowDownRight size={14} />
                                                ${product.min.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-blue-900 text-base">
                                            ${product.avg.toFixed(2)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-red-700">
                                            <div className="flex items-center justify-end gap-1">
                                                <ArrowUpRight size={14} />
                                                ${product.max.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${
                                                product.source.includes('Factura') 
                                                    ? 'bg-blue-50 text-blue-700 border-blue-100' 
                                                    : 'bg-gray-100 text-gray-600 border-gray-200'
                                            }`}>
                                                <Tag size={10} />
                                                {product.source}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                        No se encontraron productos que coincidan con tu búsqueda.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                
                <div className="mt-4 bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg border border-yellow-100">
                    <strong>Nota:</strong> Estos precios se actualizan automáticamente cada vez que subes una factura. 
                    Actualmente se guardan en este dispositivo.
                </div>
            </div>
        </div>
    );
};

export default PriceList;