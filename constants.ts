import { PriceInfo, ProductCategory } from './types';

// ==========================================
// CATÁLOGO SIMULADO DE PRECIOS (ECUADOR - USD)
// ==========================================
// En una app real, esto vendría de una base de datos o API.
// La clave es el nombre normalizado en minúsculas.

export const MOCK_PRICE_DB: Record<string, PriceInfo> = {
    'gaseosa cola': { min: 1.50, avg: 2.25, max: 2.75, currency: 'USD', source: 'Simulada' },
    'harina de maíz precocida': { min: 1.10, avg: 1.45, max: 1.80, currency: 'USD', source: 'Simulada' },
    'arroz': { min: 0.90, avg: 1.20, max: 1.60, currency: 'USD', source: 'Simulada' }, // Precio por kg/libra aprox
    'aceite de girasol': { min: 2.50, avg: 3.50, max: 4.50, currency: 'USD', source: 'Simulada' }, // Litro
    'atún en lata': { min: 1.20, avg: 1.80, max: 2.50, currency: 'USD', source: 'Simulada' },
    'leche entera': { min: 0.85, avg: 1.10, max: 1.40, currency: 'USD', source: 'Simulada' }, // Litro
    'papel higiénico': { min: 2.50, avg: 4.00, max: 6.00, currency: 'USD', source: 'Simulada' }, // Paquete pequeño/mediano
    'detergente en polvo': { min: 3.00, avg: 5.50, max: 8.00, currency: 'USD', source: 'Simulada' },
    'yogurt': { min: 0.60, avg: 0.90, max: 1.50, currency: 'USD', source: 'Simulada' }, // Individual
    'cloro': { min: 0.80, avg: 1.20, max: 1.80, currency: 'USD', source: 'Simulada' },
    'huevos': { min: 3.50, avg: 4.50, max: 5.50, currency: 'USD', source: 'Simulada' }, // Cubeta
};

// Precio por defecto si no se encuentra en la base de datos
export const DEFAULT_PRICE_INFO: PriceInfo = {
    min: 1.00,
    avg: 1.00,
    max: 1.00,
    currency: 'USD',
    source: 'Estimado Genérico'
};

export const EXAMPLE_LIST = `3 Coca-Colas de 2 litros
2 arroces de 1kg
1 aceite de girasol
4 yogures
1 cloro
Papel higiénico`;
