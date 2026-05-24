export default function ComprasSummaryCards({
  total,
  promedioPorCompra,
  ultimaCompraMonto,
  ultimaCompraFecha,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-xl text-rose-600 dark:text-rose-400">payments</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">Total Gastado</span>
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate">
          ${total}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Acumulado en compras</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-xl text-blue-600 dark:text-blue-400">analytics</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">Ticket Promedio</span>
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate">
          ${promedioPorCompra}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Por transacción</p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-xl text-purple-600 dark:text-purple-400">history</span>
          <span className="text-sm text-slate-400 dark:text-slate-500">Última Actividad</span>
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-slate-100 mb-1 truncate">
          ${ultimaCompraMonto}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
            <p className="text-sm text-slate-500 dark:text-slate-400">{ultimaCompraFecha}</p>
        </div>
      </div>
    </div>
  );
}
