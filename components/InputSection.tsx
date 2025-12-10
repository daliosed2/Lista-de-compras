import React, { useState, useEffect, useRef } from 'react';
import { EXAMPLE_LIST } from '../constants';
import { Loader2, Sparkles, Search, Plus, Trash2 } from 'lucide-react';
import { PriceInfo } from '../types';

interface InputSectionProps {
    onProcess: (text: string) => void;
    isLoading: boolean;
    priceDb?: Record<string, PriceInfo>;
    onClearData: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({ onProcess, isLoading, priceDb = {}, onClearData }) => {
    // Inicializar texto desde LocalStorage (Persistencia del borrador)
    const [text, setText] = useState(() => {
        return localStorage.getItem('lista_smart_draft_v1') || '';
    });
    
    // Estados para el autocompletado
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Guardar borrador automáticamente
    useEffect(() => {
        localStorage.setItem('lista_smart_draft_v1', text);
    }, [text]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (text.trim()) {
            onProcess(text);
        }
    };

    const loadExample = () => {
        setText(EXAMPLE_LIST);
    };

    const handleClear = () => {
        if (window.confirm('¿Estás seguro de que deseas borrar la lista actual y los resultados?')) {
            setText('');
            localStorage.removeItem('lista_smart_draft_v1');
            onClearData();
        }
    };

    // Lógica del buscador desplegable
    const filteredProducts = (Object.entries(priceDb) as [string, PriceInfo][])
        .filter(([name]) => name.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5); // Mostrar solo los 5 primeros

    const addProductToList = (name: string, price: number) => {
        const newLine = `1 ${name} (aprox $${price.toFixed(2)})`;
        const newText = text ? `${text}\n${newLine}` : newLine;
        setText(newText);
        setSearchTerm(''); // Limpiar buscador
        setShowSuggestions(false);
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <span className="bg-green-100 text-green-600 p-1.5 rounded-lg">
                        <Sparkles size={20} />
                    </span>
                    Tu Lista de Compras
                </h2>
                {text && (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                        Guardado automático
                    </span>
                )}
            </div>
            
            {/* Buscador Rápido (Menú Desplegable) */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Buscar producto para agregar..." 
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay para permitir click
                    />
                </div>

                {/* Menú Dropdown */}
                {showSuggestions && searchTerm && filteredProducts.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                        {filteredProducts.map(([name, info]) => (
                            <button
                                key={name}
                                onClick={() => addProductToList(name, info.avg)}
                                className="w-full text-left px-4 py-2 hover:bg-green-50 flex items-center justify-between group transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-800 capitalize">{name}</p>
                                    <p className="text-xs text-gray-500">{info.source}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-green-600">${info.avg.toFixed(2)}</span>
                                    <Plus size={16} className="text-gray-300 group-hover:text-green-600" />
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <textarea
                        className="w-full h-64 p-4 border border-gray-600 bg-gray-800 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-white placeholder-gray-400 font-mono text-sm leading-relaxed"
                        placeholder="Escribe aquí o usa el buscador de arriba...&#10;Ejemplo:&#10;2 leches&#10;1 pan molde&#10;3 atunes Van Camps"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isLoading}
                    />
                    <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <div className="flex gap-3">
                            <button 
                                type="button" 
                                onClick={loadExample}
                                className="text-green-600 hover:text-green-700 font-medium hover:underline cursor-pointer"
                            >
                                Cargar ejemplo
                            </button>
                            <button 
                                type="button" 
                                onClick={handleClear}
                                className="text-red-500 hover:text-red-700 font-medium hover:underline cursor-pointer flex items-center gap-1"
                                title="Borrar lista y resultados"
                            >
                                <Trash2 size={14} />
                                Borrar todo
                            </button>
                        </div>
                        <span>{text.length} caracteres</span>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading || !text.trim()}
                    className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold text-white transition-all
                        ${isLoading || !text.trim() 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        }`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin" /> Procesando con IA...
                        </>
                    ) : (
                        'Calcular Presupuesto'
                    )}
                </button>
            </form>
        </div>
    );
};

export default InputSection;