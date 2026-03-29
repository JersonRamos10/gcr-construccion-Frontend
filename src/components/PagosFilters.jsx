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
    <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow border border-gray-100 dark:border-slate-700 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Desde
          </label>
          <input
            type="date"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300">
            Hasta
          </label>
          <input
            type="date"
            name="toDate"
            value={filters.toDate}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={handleFilter}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Filtrar
          </button>
          <button
            onClick={handleClear}
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
