export default function SummaryCards({ totalMes, promedioPorProyecto, ultimoIngreso }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      {/* Total este mes */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Total este mes</p>
          <span className="material-symbols-outlined text-lg sm:text-xl text-green-600">trending_up</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-green-600 mb-2">
          {totalMes}
        </h3>
        <p className="text-xs text-gray-500">Ingresos acumulados</p>
      </div>

      {/* Promedio por proyecto */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Promedio por proyecto</p>
          <span className="material-symbols-outlined text-lg sm:text-xl text-blue-600">bar_chart</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-2">
          {promedioPorProyecto}
        </h3>
        <p className="text-xs text-gray-500">Valor medio</p>
      </div>

      {/* Último ingreso */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Último ingreso</p>
          <span className="material-symbols-outlined text-lg sm:text-xl text-purple-600">calendar_today</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-purple-600 mb-2">
          {ultimoIngreso}
        </h3>
        <p className="text-xs text-gray-500">Fecha más reciente</p>
      </div>
    </div>
  );
}
