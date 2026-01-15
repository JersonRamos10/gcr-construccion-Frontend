export default function ComprasSummaryCards({
  total,
  promedioPorCompra,
  ultimaCompra,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
      {/* Total */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Total Compras</p>
          <span className="material-symbols-outlined text-lg sm:text-xl text-red-600">trending_down</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-red-600 mb-1">
          ${total}
        </h3>
        <p className="text-xs text-gray-500">Gasto total</p>
      </div>

      {/* Promedio */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Promedio por Compra</p>
          <span className="material-symbols-outlined text-lg sm:text-xl text-blue-600">bar_chart</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-blue-600 mb-1">
          ${promedioPorCompra}
        </h3>
        <p className="text-xs text-gray-500">Monto promedio</p>
      </div>

      {/* Última Compra */}
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-sm transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs sm:text-sm font-medium text-gray-600">Última Compra</p>
          <span className="material-symbols-outlined text-lg sm:text-xl text-purple-600">shopping_cart</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-semibold text-purple-600 mb-1">
          ${ultimaCompra}
        </h3>
        <p className="text-xs text-gray-500">Registro más reciente</p>
      </div>
    </div>
  );
}
