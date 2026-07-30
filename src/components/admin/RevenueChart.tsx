"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Calendar } from "lucide-react";

export interface MonthlyDataPoint {
  mes: string;
  ingresos: number;
}

export interface WeeklyDataPoint {
  semana: Date | string;
  ingresos: number;
}

interface RevenueChartProps {
  monthlyData: MonthlyDataPoint[];
  weeklyData: WeeklyDataPoint[];
}

function formatWeeklyLabel(rawDate: Date | string): string {
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);
  const day = d.getDate();
  const monthStr = d.toLocaleDateString("es-AR", { month: "short" });
  return `${day} ${monthStr.replace(".", "")}`;
}

function formatWeeklyTooltip(rawDate: Date | string): string {
  const d = new Date(rawDate);
  if (isNaN(d.getTime())) return String(rawDate);
  const day = d.getDate();
  const monthStr = d.toLocaleDateString("es-AR", { month: "long" });
  return `Semana del ${day} de ${monthStr}`;
}

function formatMonthlyLabel(rawMonth: string): string {
  const parts = rawMonth.split("-");
  if (parts.length === 2) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const date = new Date(parseInt(year, 10), monthIndex, 1);
    const monthStr = date.toLocaleDateString("es-AR", { month: "short" });
    return `${monthStr.charAt(0).toUpperCase() + monthStr.slice(1)} '${year.slice(2)}`;
  }
  return rawMonth;
}

export default function RevenueChart({ monthlyData = [], weeklyData = [] }: RevenueChartProps) {
  const [viewMode, setViewMode] = useState<"mensual" | "semanal">("mensual");

  const currentData = viewMode === "mensual"
    ? monthlyData.map(d => ({
        id: d.mes,
        label: formatMonthlyLabel(d.mes),
        tooltipLabel: `Mes: ${d.mes}`,
        ingresos: d.ingresos,
      }))
    : weeklyData.map(d => ({
        id: String(d.semana),
        label: formatWeeklyLabel(d.semana),
        tooltipLabel: formatWeeklyTooltip(d.semana),
        ingresos: d.ingresos,
      }));

  const maxIngreso = currentData.length > 0
    ? Math.max(...currentData.map(d => d.ingresos), 1)
    : 1;

  const totalIngresosPeriodo = currentData.reduce((acc, curr) => acc + curr.ingresos, 0);

  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
      {/* Header with Title and Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#31572C]/10 flex items-center justify-center text-[#31572C]">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Evolución de Ingresos</h2>
            <p className="text-sm text-gray-500">
              Total periodo:{" "}
              <span className="font-bold text-gray-900">
                ${totalIngresosPeriodo.toLocaleString("es-AR")}
              </span>
            </p>
          </div>
        </div>

        {/* Toggle Switch Component */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl w-fit border border-gray-200/80">
          <button
            onClick={() => setViewMode("mensual")}
            className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
              viewMode === "mensual" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {viewMode === "mensual" && (
              <motion.div
                layoutId="activeChartTab"
                className="absolute inset-0 bg-[#31572C] rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Mensual
            </span>
          </button>

          <button
            onClick={() => setViewMode("semanal")}
            className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-colors z-10 ${
              viewMode === "semanal" ? "text-white" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {viewMode === "semanal" && (
              <motion.div
                layoutId="activeChartTab"
                className="absolute inset-0 bg-[#31572C] rounded-lg shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Semanal
            </span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      {currentData.length === 0 ? (
        <div className="text-center py-16 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
          No hay datos de ventas para la vista {viewMode}.
        </div>
      ) : (
        <div className="relative pt-6">
          <div className="flex items-end gap-2 sm:gap-4 h-64 border-b border-gray-100 pb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="w-full flex items-end gap-2 sm:gap-3 h-full"
              >
                {currentData.map((item, idx) => {
                  const heightPercent = Math.max(8, Math.round((item.ingresos / maxIngreso) * 100));

                  return (
                    <div
                      key={item.id || idx}
                      className="flex-1 flex flex-col justify-end items-center group relative h-full"
                    >
                      {/* Tooltip Hover */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-gray-900 text-white text-xs py-1.5 px-3 rounded-lg font-bold pointer-events-none whitespace-nowrap shadow-xl z-20 flex flex-col items-center">
                        <span className="text-[10px] text-gray-400 font-normal">{item.tooltipLabel}</span>
                        <span>${item.ingresos.toLocaleString("es-AR")}</span>
                        <div className="w-2 h-2 bg-gray-900 rotate-45 -mb-1 mt-0.5" />
                      </div>

                      {/* Bar Container */}
                      <div className="w-full h-full flex items-end justify-center px-0.5">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPercent}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.03 }}
                          className="w-full max-w-[48px] bg-gradient-to-t from-[#31572C] to-[#4F8A43] hover:from-[#31572C] hover:to-[#90A955] rounded-t-lg transition-colors shadow-sm cursor-pointer relative group-hover:shadow-md"
                        />
                      </div>

                      {/* Axis Label */}
                      <span className="text-[11px] font-medium text-gray-500 mt-3 truncate max-w-full text-center">
                        {item.label}
                      </span>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
