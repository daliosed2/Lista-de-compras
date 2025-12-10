// Definición de tipos para la aplicación

// Enumeración de categorías de productos
export enum ProductCategory {
    PANTRY = 'Despensa',
    BEVERAGES = 'Bebidas',
    DAIRY = 'Lácteos',
    CLEANING = 'Limpieza',
    PRODUCE = 'Frutas y Verduras',
    MEAT = 'Carnes',
    PERSONAL_CARE = 'Cuidado Personal',
    OTHER = 'Otros'
}

// Estructura que devuelve la IA (Parseo inicial)
export interface ParsedItem {
    raw_text: string; // Texto original (para referencia)
    normalized_name: string; // Nombre estandarizado (ej: "Gaseosa cola")
    brand?: string; // Marca detectada (ej: "Coca-Cola")
    quantity: number; // Cantidad numérica
    unit_size?: string; // Presentación (ej: "2L", "1kg")
    category: ProductCategory | string;
}

// Estructura de precios (Simulada o de API)
export interface PriceInfo {
    min: number;
    avg: number;
    max: number;
    currency: string;
    source: string; // 'Simulada', 'Supermaxi API', 'Factura Escaneada', etc.
}

// Item completo enriquecido con precios
export interface EnrichedItem extends ParsedItem {
    price_info: PriceInfo;
    total_min: number; // quantity * price_min
    total_avg: number; // quantity * price_avg
    total_max: number; // quantity * price_max
}

// Resumen del presupuesto
export interface BudgetSummary {
    total_min: number;
    total_avg: number;
    total_max: number;
    savings_potential: number; // avg - min
    items_count: number;
}

// Item extraído de una factura
export interface InvoiceItem {
    product_name: string;
    price: number;
    date?: string;
}