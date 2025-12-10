import React from 'react';
import { BudgetSummary as BudgetSummaryType } from '../types';
import { TrendingDown, TrendingUp, DollarSign, PiggyBank } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface BudgetSummaryProps {
    summary: BudgetSummaryType;
    categoryData: { name: string; value: number }[];
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ summary, categoryData }) => {
    
    const chartData = [
        { name: 'Mínimo', amount: summary.total_min, color: '#22c55e' }, // green-500
        { name: 'Promedio', amount: summary.total_avg, color: '#3b82f6' }, // blue-500
        { name: 'Máximo', amount: summary.total_max, color: '#ef4444' }, // red-500
    ];

    return (
        <div className="space-y-6">
            {/* Cards de Resumen */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mínimo */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100 border-l-4 border-l-green-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Presupuesto Mínimo</span>
                        <TrendingDown size={18} className="text-green-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">${summary.total_min.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">Buscando ofertas</div>
                </div>

                {/* Promedio */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Estimado Promedio</span>
                        <DollarSign size={18} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">${summary.total_avg.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">Precio mercado regular</div>
                </div>

                {/* Máximo */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-red-100 border-l-4 border-l-red-500">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-500">Escenario Caro</span>
                        <TrendingUp size={18} className="text-red-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-800">${summary.total_max.toFixed(2)}</div>
                    <div className="text-xs text-gray-400 mt-1">Productos premium</div>
                </div>
            </div>

            {/* Modo Ahorro Banner */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <PiggyBank size={32} />
                </div>
                <div>
                    <h4 className="font-bold text-green-800">¡Modo Ahorro!</h4>
                    <p className="text-sm text-green-700">
                        Si eliges siempre la opción más barata, ahorras aproximadamente 
                        <span className="font-bold text-lg mx-1">${summary.savings_potential.toFixed(2)} USD</span> 
                        frente al precio promedio.
                    </p>
                </div>
            </div>

            {/* Gráfico Simple de Rango */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4 text-sm uppercase tracking-wide">Rango de Presupuesto</h3>
                <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                            <Tooltip 
                                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Total']}
                                cursor={{fill: 'transparent'}}
                            />
                            <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={30}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default BudgetSummary;
