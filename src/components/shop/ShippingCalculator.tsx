"use client";

import { useState } from "react";
import { Truck } from "lucide-react";

interface ShippingCalculatorProps {
  total: number;
}

export function calculateShippingCost(cp: string, total: number): number {
  if (total >= 150000) return 0;
  
  if (cp.startsWith('1')) return 3500;
  if (cp.startsWith('2') || cp.startsWith('3')) return 5500;
  
  return 8000;
}

export default function ShippingCalculator({ total }: ShippingCalculatorProps) {
  const [cp, setCp] = useState("");
  const [result, setResult] = useState<{ cost: number, days: string } | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cp || cp.trim().length < 4) {
      setError("Ingresa un código postal válido");
      setResult(null);
      return;
    }
    
    setError("");
    const cost = calculateShippingCost(cp, total);
    
    let days = "Llega en 3 a 5 días hábiles";
    if (cost === 0 && cp.startsWith('1')) {
       days = "Llega mañana";
    }

    setResult({ cost, days });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      <div className="flex items-center gap-2 font-semibold text-sm">
        <Truck size={18} /> Calculadora de envío
      </div>
      <form onSubmit={handleCalculate} className="flex gap-2">
        <input 
          type="text" 
          value={cp}
          onChange={(e) => setCp(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="Tu código postal" 
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
        />
        <button 
          type="submit"
          className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-900 transition-colors"
        >
          Calcular
        </button>
      </form>
      
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      
      {result && (
        <div className="mt-3 p-3 bg-white border border-green-100 rounded-lg flex flex-col">
          <span className="text-sm font-bold text-gray-900">
            {result.cost === 0 ? "Envío Gratis" : `Costo de envío: $${result.cost.toLocaleString('es-AR')}`}
          </span>
          <span className="text-xs text-green-600 font-medium mt-0.5">
            {result.days}
          </span>
        </div>
      )}
    </div>
  );
}
