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
      <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm bg-white">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 font-semibold">Fecha</th>
              <th className="px-6 py-3 font-semibold">Empleado</th>
              <th className="px-6 py-3 font-semibold text-center">Días Trab.</th>
              <th className="px-6 py-3 font-semibold text-right">Pago Diario</th>
              <th className="px-6 py-3 font-semibold text-right">Total Pagado</th>
              <th className="px-6 py-3 font-semibold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  No se encontraron pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr key={pago.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">{formatearFecha(pago.fechaPago)}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {pago.empleadoNombre}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {pago.diasTrabajados} días
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {formatearMoneda(pago.pagoPorDia)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">
                    {formatearMoneda(pago.totalPagado)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onDelete(pago.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition-colors"
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

      {/* --- SECCIÓN DE PAGINACIÓN ACTUALIZADA --- */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 border border-gray-200 rounded-lg bg-white shadow-sm">
        <span className="text-sm text-gray-600">
          Mostrando {Math.min((paginaActual - 1) * pageSize + 1, totalItems)} a{" "}
          {Math.min(paginaActual * pageSize, totalItems)} de {totalItems}
        </span>
        
        <div className="flex gap-1 flex-wrap justify-center">
          {/* Botón Anterior */}
          <button
            onClick={() => onChangePagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>

          {/* Números de Página */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onChangePagina(page)}
                className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                  paginaActual === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 hover:bg-gray-100 text-gray-700"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Botón Siguiente */}
          <button
            onClick={() => onChangePagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-100 disabled:opacity-50 transition-colors flex items-center"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}