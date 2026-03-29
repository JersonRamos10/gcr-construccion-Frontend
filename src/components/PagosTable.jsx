import Pagination from "./Pagination";

export default function PagosTable({ 
  pagos, 
  paginaActual, 
  totalPaginas, 
  totalItems, 
  onChangePagina, 
  onDelete,
  pageSize 
}) {
    
  const formatearMoneda = (valor) => {
    return Number(valor).toLocaleString("es-SV", { style: "currency", currency: "USD" });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    // Ajusta la zona horaria si es necesario, o usa split para evitar problemas de UTC
    return new Date(fecha).toLocaleDateString("es-ES", {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-sm text-left text-gray-600 dark:text-slate-300">
          <thead className="bg-gray-50 dark:bg-slate-800 text-xs text-gray-700 dark:text-slate-400 uppercase border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 font-semibold hidden sm:table-cell">Fecha</th>
              <th className="px-4 sm:px-6 py-3 font-semibold">Empleado</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-center hidden md:table-cell">Días Trab.</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-right hidden md:table-cell">Pago Diario</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-right">Total Pagado</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500 dark:text-slate-400">
                  No se encontraron pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr key={pago.id} className="border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-sm">{formatearFecha(pago.fechaPago)}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-slate-100">{pago.empleadoNombre}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 sm:hidden">{formatearFecha(pago.fechaPago)}</div>
                    <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 md:hidden">
                      <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded text-xs">{pago.diasTrabajados}d</span>
                      <span className="ml-1">{formatearMoneda(pago.pagoPorDia)}/día</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center hidden md:table-cell">
                    <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 text-xs font-medium px-2.5 py-0.5 rounded">
                      {pago.diasTrabajados} días
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right text-gray-500 dark:text-slate-400 hidden md:table-cell">
                    {formatearMoneda(pago.pagoPorDia)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right font-bold text-green-700 dark:text-green-400">
                    {formatearMoneda(pago.totalPagado)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(pago.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded transition-colors"
                      title="Eliminar registro"
                    >
                      <span className="material-symbols-outlined text-xl">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        totalItems={totalItems}
        pageSize={pageSize}
        onChangePagina={onChangePagina}
      />
    </div>
  );
}