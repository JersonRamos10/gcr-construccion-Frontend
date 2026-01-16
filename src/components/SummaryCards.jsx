export default function SummaryCards({ totalMes, promedioPorProyecto, ultimoIngreso }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      
      {/* Total este mes - Estilo Verde */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-green-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-green-50 rounded-lg">
            <span className="material-symbols-outlined text-xl text-green-600">trending_up</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total este mes</span>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">
          {totalMes}
        </h3>
        <p className="text-sm text-slate-500 font-medium">Ingresos acumulados</p>
      </div>

      {/* Promedio - Estilo Azul */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <span className="material-symbols-outlined text-xl text-blue-600">bar_chart</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Promedio Ticket</span>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">
          {promedioPorProyecto}
        </h3>
        <p className="text-sm text-slate-500 font-medium">Por ingreso registrado</p>
      </div>

      {/* Último Ingreso - Estilo Morado */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <span className="material-symbols-outlined text-xl text-purple-600">calendar_month</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Última Actividad</span>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-1 leading-tight">
          {ultimoIngreso}
        </h3>
        <p className="text-sm text-slate-500 font-medium">Fecha más reciente</p>
      </div>
    </div>
  );
}