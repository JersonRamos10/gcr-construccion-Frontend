export default function ComprasSummaryCards({
  total,
  promedioPorCompra,
  ultimaCompraMonto,
  ultimaCompraFecha,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
      
      {/* Total - Estilo Rojo Pasivo */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-rose-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-rose-50 rounded-lg">
            <span className="material-symbols-outlined text-xl text-rose-600">payments</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Gastado</span>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">
          ${total}
        </h3>
        <p className="text-sm text-slate-500 font-medium">Acumulado en compras</p>
      </div>

      {/* Promedio - Estilo Azul Pasivo */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <span className="material-symbols-outlined text-xl text-blue-600">analytics</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">
          ${promedioPorCompra}
        </h3>
        <p className="text-sm text-slate-500 font-medium">Por transacción</p>
      </div>

      {/* Última Compra - Estilo Morado Pasivo */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <span className="material-symbols-outlined text-xl text-purple-600">history</span>
          </div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Última Actividad</span>
        </div>
        <h3 className="text-3xl font-bold text-slate-800 mb-1">
          ${ultimaCompraMonto}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
            <span className="material-symbols-outlined text-sm text-slate-400">calendar_today</span>
            <p className="text-sm font-semibold text-purple-600">{ultimaCompraFecha}</p>
        </div>
      </div>
    </div>
  );
}