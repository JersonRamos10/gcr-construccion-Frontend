import { useState } from "react";

export default function PagosFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilter = () => {
    onFilterChange(filters);
  };

  const handleClear = () => {
    const clearedFilters = {
      fromDate: "",
      toDate: "",
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-4">
      <div className="flex flex-col sm:flex-row gap-3 items-end">
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Desde</label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
          />
        </div>
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-1">Hasta</label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
            className="block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleFilter}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-sm transition-colors"
          >
            Filtrar
          </button>
          <button
            onClick={handleClear}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-semibold rounded-lg text-sm transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
