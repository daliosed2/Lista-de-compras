import React, { useState, useEffect } from 'react';
import InputSection from './components/InputSection';
import ResultsTable from './components/ResultsTable';
import BudgetSummary from './components/BudgetSummary';
import InvoiceUpload from './components/InvoiceUpload';
import PriceList from './components/PriceList';
import { parseShoppingListWithAI } from './services/geminiService';
import { enrichItemsWithPrices, calculateBudget } from './services/priceService';
import { EnrichedItem, BudgetSummary as BudgetSummaryType, PriceInfo, InvoiceItem } from './types';
import { MOCK_PRICE_DB } from './constants';
import { ShoppingBag, AlertCircle, ListTodo, FileScan, Database } from 'lucide-react';

const App: React.FC = () => {
    // State para navegación: 'list' (Presupuesto), 'invoice' (Cargar Factura), 'prices' (Ver Catálogo)
    const [activeTab, setActiveTab] = useState<'list' | 'invoice' | 'prices'>('list');

    // Inicializar DB desde LocalStorage si existe, si no, usar Mock
    const [priceDb, setPriceDb] = useState<Record<string, PriceInfo>>(() => {
        try {
            const savedDb = localStorage.getItem('lista_smart_prices_v1');
            // Merge con la base simulada para asegurar que siempre haya datos base + nuevos
            const parsedSaved = savedDb ? JSON.parse(savedDb) : {};
            return { ...MOCK_PRICE_DB, ...parsedSaved };
        } catch (e) {
            console.error("Error cargando precios locales", e);
            return MOCK_PRICE_DB;
        }
    });

    // Inicializar Items procesados desde LocalStorage (Persistencia de resultados)
    const [items, setItems] = useState<EnrichedItem[]>(() => {
        try {
            const savedItems = localStorage.getItem('lista_smart_items_v1');
            return savedItems ? JSON.parse(savedItems) : [];
        } catch (e) { return []; }
    });

    // Inicializar Presupuesto desde LocalStorage
    const [budget, setBudget] = useState<BudgetSummaryType | null>(() => {
        try {
            const savedBudget = localStorage.getItem('lista_smart_budget_v1');
            return savedBudget ? JSON.parse(savedBudget) : null;
        } catch (e) { return null; }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Guardar en LocalStorage cada vez que cambie la DB
    useEffect(() => {
        try {
            // Guardamos todo el objeto priceDb (que ya incluye el mock + nuevos)
            localStorage.setItem('lista_smart_prices_v1', JSON.stringify(priceDb));
        } catch (e) {
            console.error("Error guardando precios locales", e);
        }
    }, [priceDb]);

    // Guardar en LocalStorage cada vez que cambien los items o el budget
    useEffect(() => {
        try {
            if (items.length > 0) {
                localStorage.setItem('lista_smart_items_v1', JSON.stringify(items));
            } else {
                localStorage.removeItem('lista_smart_items_v1');
            }
            
            if (budget) {
                localStorage.setItem('lista_smart_budget_v1', JSON.stringify(budget));
            } else {
                localStorage.removeItem('lista_smart_budget_v1');
            }
        } catch (e) {
            console.error("Error guardando estado de lista", e);
        }
    }, [items, budget]);

    const handleProcessList = async (text: string) => {
        setLoading(true);
        setError(null);
        // No borramos items inmediatamente para evitar parpadeos bruscos, reemplazamos al final
        
        try {
            // 1. LLamar a IA para parsear
            const parsedItems = await parseShoppingListWithAI(text);
            
            // 2. Enriquecer con precios (Usando la DB dinámica)
            const enrichedItems = enrichItemsWithPrices(parsedItems, priceDb);
            
            // 3. Calcular totales
            const budgetSummary = calculateBudget(enrichedItems);

            setItems(enrichedItems);
            setBudget(budgetSummary);

        } catch (err) {
            console.error(err);
            setError("Hubo un problema al procesar tu lista. Por favor, verifica tu conexión o intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePrices = (newItems: InvoiceItem[]) => {
        setPriceDb(prevDb => {
            const updatedDb = { ...prevDb };
            let count = 0;
            
            newItems.forEach(item => {
                const key = item.product_name.toLowerCase().trim();
                
                updatedDb[key] = {
                    min: Number((item.price * 0.9).toFixed(2)), // Estimamos rango +/- 10%
                    avg: item.price,
                    max: Number((item.price * 1.1).toFixed(2)),
                    currency: 'USD',
                    source: 'Factura Escaneada' // Marcamos la fuente
                };
                count++;
            });
            
            setTimeout(() => {
                alert(`¡Éxito! Base de conocimientos actualizada con ${count} productos.`);
                setActiveTab('prices');
            }, 100);

            return updatedDb;
        });
    };

    const handleResetDb = () => {
        if(window.confirm("¿Seguro que quieres restaurar la base de precios a los valores de fábrica? Se perderán los precios de facturas escaneadas.")){
            setPriceDb(MOCK_PRICE_DB);
            localStorage.removeItem('lista_smart_prices_v1');
        }
    };

    const handleClearData = () => {
        setItems([]);
        setBudget(null);
        localStorage.removeItem('lista_smart_items_v1');
        localStorage.removeItem('lista_smart_budget_v1');
    };

    // Preparar datos para gráficos
    const categoryData = React.useMemo(() => {
        const catMap: Record<string, number> = {};
        items.forEach(item => {
            const cat = item.category as string;
            catMap[cat] = (catMap[cat] || 0) + item.total_avg;
        });
        return Object.entries(catMap).map(([name, value]) => ({ name, value }));
    }, [items]);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
            {/* Header Sticky */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="bg-green-600 text-white p-2 rounded-lg">
                            <ShoppingBag size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-none">Lista Smart</h1>
                            <span className="text-xs text-gray-500 font-medium">Presupuesto Inteligente</span>
                        </div>
                    </div>

                    {/* Navegación Tabs */}
                    <nav className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === 'list' 
                                ? 'bg-white text-gray-800 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <ListTodo size={16} />
                            <span>Mi Lista</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('invoice')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === 'invoice' 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <FileScan size={16} />
                            <span>Subir Factura</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('prices')}
                            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                                activeTab === 'prices' 
                                ? 'bg-white text-purple-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            <Database size={16} />
                            <span>Precios</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
                
                {/* Renderizado Condicional de Tabs */}

                {activeTab === 'list' && (
                    <>
                        <div className="text-center max-w-2xl mx-auto mb-8 animate-in fade-in">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Planifica tus compras</h2>
                            <p className="text-gray-600">
                                La IA usa tu base de precios personal. ¡Cuantas más facturas subas, más exacto será!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            {/* Columna Izquierda: Input con Autocompletado */}
                            <div className="lg:col-span-5 space-y-4">
                                <InputSection 
                                    onProcess={handleProcessList} 
                                    isLoading={loading} 
                                    priceDb={priceDb} // Pasamos la DB para el menú desplegable
                                    onClearData={handleClearData}
                                />
                                
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="mt-0.5 shrink-0" size={20} />
                                        <p className="text-sm">{error}</p>
                                    </div>
                                )}
                            </div>

                            {/* Columna Derecha: Resultados */}
                            <div className="lg:col-span-7 space-y-6">
                                {loading && (
                                    <div className="space-y-4 animate-pulse">
                                        <div className="h-32 bg-gray-200 rounded-xl"></div>
                                        <div className="h-64 bg-gray-200 rounded-xl"></div>
                                    </div>
                                )}

                                {!loading && budget && (
                                    <>
                                        <BudgetSummary summary={budget} categoryData={categoryData} />
                                        <ResultsTable items={items} />
                                    </>
                                )}
                                
                                {!loading && !budget && !error && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-xl">
                                        <ShoppingBag size={48} className="mb-4 opacity-20" />
                                        <p>Tus resultados aparecerán aquí</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'invoice' && (
                    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-right-4">
                        <InvoiceUpload onUpdatePrices={handleUpdatePrices} />
                    </div>
                )}

                {activeTab === 'prices' && (
                    <div className="relative">
                        <button 
                            onClick={handleResetDb}
                            className="absolute top-0 right-0 mt-6 mr-6 text-xs text-red-500 hover:text-red-700 hover:underline z-10"
                        >
                            Restaurar precios de fábrica
                        </button>
                        <PriceList priceDb={priceDb} />
                    </div>
                )}

            </main>
        </div>
    );
};

export default App;