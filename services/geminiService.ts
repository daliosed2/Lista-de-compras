import { GoogleGenAI, Type } from "@google/genai";
import { ParsedItem, InvoiceItem } from "../types";

// Inicializar cliente de GenAI
// NOTA: Se asume que process.env.API_KEY está configurado en el entorno
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Función auxiliar para convertir File a Base64
 */
const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve({
                inlineData: {
                    data: base64String,
                    mimeType: file.type
                }
            });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Función para procesar texto libre y convertirlo en JSON estructurado.
 * Usa un modelo rápido (Flash) para baja latencia.
 */
export const parseShoppingListWithAI = async (inputText: string): Promise<ParsedItem[]> => {
    try {
        const modelName = 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
            model: modelName,
            contents: inputText,
            config: {
                systemInstruction: `
                    Actúa como un asistente experto en compras de supermercado para Ecuador.
                    Tu tarea es leer una lista de compras en lenguaje natural (posiblemente con errores ortográficos) y estructurarla.
                    
                    REGLAS DE NORMALIZACIÓN:
                    1. Corrige nombres mal escritos (ej: "cocacola" -> "Coca-Cola", "arros" -> "Arroz").
                    2. Estandariza el "nombre_normalizado" a términos genéricos de supermercado (ej: "Coca-Cola" -> "Gaseosa cola", "Deja" -> "Detergente en polvo").
                    3. Extrae la marca si se menciona explícitamente.
                    4. Extrae la cantidad numérica. Si no se menciona, asume 1.
                    5. Extrae el tamaño o unidad si se menciona (ej: "2 litros", "grande", "pack").
                    6. Categoriza el producto en una de estas categorías: Despensa, Bebidas, Lácteos, Limpieza, Frutas y Verduras, Carnes, Cuidado Personal, Otros.
                    
                    Responde ÚNICAMENTE con el objeto JSON solicitado.
                `,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            raw_text: { type: Type.STRING, description: "El texto original o aproximado del usuario para este item" },
                            normalized_name: { type: Type.STRING, description: "Nombre genérico del producto (ej: Gaseosa cola)" },
                            brand: { type: Type.STRING, description: "Marca del producto si existe (ej: Coca-Cola), o null si no aplica", nullable: true },
                            quantity: { type: Type.NUMBER, description: "Cantidad de unidades" },
                            unit_size: { type: Type.STRING, description: "Tamaño o presentación (ej: 2L, 500g)", nullable: true },
                            category: { type: Type.STRING, description: "Categoría del producto" }
                        },
                        required: ["normalized_name", "quantity", "category"]
                    }
                }
            }
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("No se recibió respuesta del modelo.");
        }

        const parsedData = JSON.parse(textResponse) as ParsedItem[];
        return parsedData;

    } catch (error) {
        console.error("Error al procesar la lista con IA:", error);
        throw error;
    }
};

/**
 * Procesa una imagen o PDF de factura para extraer productos y precios unitarios.
 */
export const parseInvoiceWithAI = async (file: File): Promise<InvoiceItem[]> => {
    try {
        const modelName = 'gemini-2.5-flash'; // Modelo multimodal eficiente (soporta PDF e imágenes)
        const filePart = await fileToGenerativePart(file);

        const prompt = `
            Analiza este documento (puede ser una imagen o un PDF de una factura electrónica).
            Extrae una lista de los productos comprados y su PRECIO UNITARIO final (incluyendo impuestos si es posible deducirlo, o el precio de lista).
            
            1. Normaliza el nombre del producto para que sea genérico pero útil (ej: "Leche Entera 1L" en vez de códigos raros).
            2. Ignora items que no sean productos (como "Subtotal", "Descuento", "Propina", "Datos del cliente").
            3. Extrae el precio unitario numérico.
            
            Devuelve un JSON.
        `;

        const response = await ai.models.generateContent({
            model: modelName,
            contents: {
                parts: [
                    filePart,
                    { text: prompt }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            product_name: { type: Type.STRING, description: "Nombre normalizado del producto" },
                            price: { type: Type.NUMBER, description: "Precio unitario encontrado" }
                        },
                        required: ["product_name", "price"]
                    }
                }
            }
        });

        const textResponse = response.text;
        if (!textResponse) return [];

        return JSON.parse(textResponse) as InvoiceItem[];

    } catch (error) {
        console.error("Error al procesar la factura:", error);
        throw error;
    }
};