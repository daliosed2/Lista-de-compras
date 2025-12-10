import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { EnrichedItem, BudgetSummary } from '../types';

export const generateShoppingListPDF = (items: EnrichedItem[], summary: BudgetSummary | null) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

    // 1. Header
    doc.setFillColor(22, 163, 74); // Green-600
    doc.rect(0, 0, 210, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Lista Smart - Presupuesto de Compras', 14, 13);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(date, 195, 13, { align: 'right' });

    // 2. Summary Section
    let startY = 30;
    
    if (summary) {
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Resumen Financiero', 14, startY);
        
        startY += 8;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        // Draw simple summary box
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(249, 250, 251); // Gray-50
        doc.roundedRect(14, startY, 182, 25, 3, 3, 'FD');

        // Mínimo
        doc.text('Presupuesto Mínimo:', 20, startY + 10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(22, 163, 74); // Green
        doc.text(`$${summary.total_min.toFixed(2)}`, 20, startY + 18);

        // Promedio
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Estimado Promedio:', 85, startY + 10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(37, 99, 235); // Blue
        doc.text(`$${summary.total_avg.toFixed(2)}`, 85, startY + 18);

        // Máximo
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        doc.text('Escenario Máximo:', 150, startY + 10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(220, 38, 38); // Red
        doc.text(`$${summary.total_max.toFixed(2)}`, 150, startY + 18);
        
        startY += 35;
    }

    // 3. Table of Items
    const tableData = items.map(item => [
        item.normalized_name,
        item.quantity,
        `${item.brand || '-'} ${item.unit_size || ''}`,
        item.category,
        `$${item.price_info.avg.toFixed(2)}`,
        `$${item.total_avg.toFixed(2)}`
    ]);

    autoTable(doc, {
        startY: startY,
        head: [['Producto', 'Cant.', 'Detalles', 'Categoría', 'Precio Unit.', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
        styles: { fontSize: 9, cellPadding: 3 },
        columnStyles: {
            0: { cellWidth: 'auto' }, // Producto
            1: { cellWidth: 15, halign: 'center' }, // Cant
            4: { halign: 'right' }, // Precio
            5: { halign: 'right', fontStyle: 'bold' }  // Total
        },
        foot: [[
            'TOTAL ESTIMADO', 
            items.reduce((acc, i) => acc + i.quantity, 0).toString(), 
            '', 
            '', 
            '', 
            `$${summary?.total_avg.toFixed(2)}`
        ]],
        footStyles: { fillColor: [240, 240, 240], textColor: 0, fontStyle: 'bold' }
    });

    // 4. Footer info
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Generado por Lista Smart - Precios referenciales estimados.', 14, finalY);

    // Save
    doc.save(`Lista_Smart_${new Date().toISOString().slice(0,10)}.pdf`);
};