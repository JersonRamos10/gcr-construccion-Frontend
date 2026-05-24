export default function SummaryCards({ totalMes, promedioPorProyecto, ultimoIngreso }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      
      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-xl text-green-600 dark:text-green-400">trending_up</span>
          <span className="text-sm text-slate-400 dark:text-neutral-500">Total este mes</span>
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-neutral-100 mb-1 truncate">
          {totalMes}
        </h3>
        <p className="text-sm text-slate-500 dark:text-neutral-400">Ingresos acumulados</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-xl text-blue-600 dark:text-blue-400">bar_chart</span>
          <span className="text-sm text-slate-400 dark:text-neutral-500">Promedio Ticket</span>
        </div>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-800 dark:text-neutral-100 mb-1 truncate">
          {promedioPorProyecto}
        </h3>
        <p className="text-sm text-slate-500 dark:text-neutral-400">Por ingreso registrado</p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-xl border border-slate-100 dark:border-neutral-700 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="material-symbols-outlined text-xl text-purple-600 dark:text-purple-400">calendar_month</span>
          <span className="text-sm text-slate-400 dark:text-neutral-500">Última Actividad</span>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-neutral-100 mb-1 leading-tight">
          {ultimoIngreso}
        </h3>
        <p className="text-sm text-slate-500 dark:text-neutral-400">Fecha más reciente</p>
      </div>
    </div>
  );
}
