import { useState } from "react";
import { showConfirm } from "../utils/alerts";
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
  const [pagoSeleccionado, setPagoSeleccionado] = useState(null);
    
  const formatearMoneda = (valor) => {
    return Number(valor).toLocaleString("es-SV", { style: "currency", currency: "USD" });
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    return new Date(fecha).toLocaleDateString("es-ES", {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  const handleEliminar = async (id) => {
    const confirmado = await showConfirm("¿Eliminar este pago?", "No podrás recuperarlo.");
    if (confirmado) await onDelete(id);
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <table className="w-full text-sm text-left text-slate-600 dark:text-neutral-300">
          <thead className="border-b border-slate-200 dark:border-neutral-700">
            <tr>
              <th className="px-4 sm:px-6 py-3 font-semibold text-slate-500 dark:text-neutral-400 hidden sm:table-cell">Fecha</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-slate-500 dark:text-neutral-400">Empleado</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-center hidden md:table-cell text-slate-500 dark:text-neutral-400">Días Trab.</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-right hidden md:table-cell text-slate-500 dark:text-neutral-400">Pago Diario</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-right hidden lg:table-cell text-slate-500 dark:text-neutral-400">Monto Extra</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-right text-slate-500 dark:text-neutral-400">Total Pagado</th>
              <th className="px-4 sm:px-6 py-3 font-semibold text-center text-slate-500 dark:text-neutral-400">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-slate-400 dark:text-neutral-500">
                  No se encontraron pagos registrados.
                </td>
              </tr>
            ) : (
              pagos.map((pago) => (
                <tr key={pago.id} onClick={() => setPagoSeleccionado(pago)} className="border-b border-slate-100 dark:border-neutral-800 cursor-pointer last:border-0">
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-sm text-slate-600 dark:text-neutral-300">{formatearFecha(pago.fechaPago)}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <div className="font-medium text-slate-800 dark:text-neutral-100">{pago.empleadoNombre}</div>
                    <div className="text-xs text-slate-400 dark:text-neutral-500 mt-0.5 sm:hidden">{formatearFecha(pago.fechaPago)}</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center hidden md:table-cell text-slate-600 dark:text-neutral-300">
                    {pago.diasTrabajados} días
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right text-slate-600 dark:text-neutral-300 hidden md:table-cell">
                    {formatearMoneda(pago.pagoPorDia)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right hidden lg:table-cell">
                    {pago.montoExtra > 0 ? (
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        +{formatearMoneda(pago.montoExtra)}
                      </span>
                    ) : (
                      <span className="text-slate-400 dark:text-neutral-500">—</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right font-medium text-green-700 dark:text-green-400">
                    {formatearMoneda(pago.totalPagado)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEliminar(pago.id); }}
                      className="text-slate-400 hover:text-red-600 p-2 rounded transition-colors"
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

      {pagoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100 dark:border-neutral-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-700 flex justify-between items-start">
                <h3 className="text-base font-medium text-slate-800 dark:text-neutral-100">Detalle de Pago</h3>
                <button onClick={() => setPagoSeleccionado(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all"><span className="material-symbols-outlined text-xl block">close</span></button>
            </div>
            <div className="p-6 space-y-4">
                <div><p className="text-xs text-slate-400 font-medium mb-1">Empleado</p><p className="text-base font-medium text-slate-800 dark:text-neutral-100">{pagoSeleccionado.empleadoNombre}</p></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Fecha</p><p className="text-base text-slate-800 dark:text-neutral-100">{formatearFecha(pagoSeleccionado.fechaPago)}</p></div>
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Días</p><p className="text-base text-slate-800 dark:text-neutral-100">{pagoSeleccionado.diasTrabajados}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Pago Diario</p><p className="text-base text-slate-800 dark:text-neutral-100">{formatearMoneda(pagoSeleccionado.pagoPorDia)}</p></div>
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Monto Extra</p><p className="text-base text-amber-600 dark:text-amber-400">{pagoSeleccionado.montoExtra > 0 ? `+${formatearMoneda(pagoSeleccionado.montoExtra)}` : "—"}</p></div>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-neutral-700">
                    <p className="text-xs text-slate-400 font-medium mb-1">Total Pagado</p>
                    <p className="text-xl font-semibold text-green-700 dark:text-green-400">{formatearMoneda(pagoSeleccionado.totalPagado)}</p>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
