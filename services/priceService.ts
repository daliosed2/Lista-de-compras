import { ParsedItem, EnrichedItem, PriceInfo } from "../types";
import { MOCK_PRICE_DB, DEFAULT_PRICE_INFO } from "../constants";

/**
 * Servicio de Precios (PriceProvider)
 * 
 * Ahora acepta una base de datos de precios opcional (priceDb) para
 * soportar actualizaciones dinámicas (ej: precios extraídos de facturas).
 */
const getPriceForProduct = (normalizedName: string, priceDb: Record<string, PriceInfo>, brand?: string): PriceInfo => {
    // Normalizamos la búsqueda a minúsculas
    const key = normalizedName.toLowerCase().trim();
    
    // 1. Intento exacto en la DB proporcionada (o la Mock por defecto)
    const dbToUse = priceDb || MOCK_PRICE_DB;

    if (dbToUse[key]) {
        return dbToUse[key];
    }

    // 2. Búsqueda parcial simple (heurística básica para el MVP)
    const partialMatch = Object.keys(dbToUse).find(k => key.includes(k) || k.includes(key));
    if (partialMatch) {
        return dbToUse[partialMatch];
    }

    // 3. Fallback a precio por defecto si no se encuentra
    return { ...DEFAULT_PRICE_INFO, source: 'Estimado (Sin datos)' };
};

/**
 * Toma los items parseados por la IA y les adjunta la información de precios.
 * Acepta un objeto `currentPrices` que contiene la "verdad actual" de los precios.
 */
export const enrichItemsWithPrices = (items: ParsedItem[], currentPrices: Record<string, PriceInfo>): EnrichedItem[] => {
    return items.map(item => {
        const priceInfo = getPriceForProduct(item.normalized_name, currentPrices, item.brand);
        
        return {
            ...item,
            price_info: priceInfo,
            total_min: item.quantity * priceInfo.min,
            total_avg: item.quantity * priceInfo.avg,
            total_max: item.quantity * priceInfo.max
        };
    });
};

/**
 * Calcula los totales globales de la lista.
 */
export const calculateBudget = (items: EnrichedItem[]) => {
    const summary = items.reduce((acc, item) => {
        return {
            total_min: acc.total_min + item.total_min,
            total_avg: acc.total_avg + item.total_avg,
            total_max: acc.total_max + item.total_max,
            items_count: acc.items_count + item.quantity
        };
    }, { total_min: 0, total_avg: 0, total_max: 0, items_count: 0 });

    return {
        ...summary,
        savings_potential: summary.total_avg - summary.total_min
    };
};