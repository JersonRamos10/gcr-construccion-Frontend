import { useState } from "react";
import { showConfirm, showAlert } from "../utils/alerts";
import Pagination from "./Pagination";

export default function IncomeTable({ 
  ingresos = [], 
  paginaActual = 1, 
  totalPaginas = 1, 
  totalItems = 0, 
  onChangePagina = () => {}, 
  onDelete = () => {}, 
  pageSize = 5,
  personas = []
}) {
  const [search, setSearch] = useState("");
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);

  const formatearFecha = (f) => { try { return new Date(f).toLocaleDateString("es-ES", {year:"numeric", month:"short", day:"numeric"}); } catch { return "--"; }};
  const formatearMonto = (m) => Number(m || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const ingresosFiltrados = ingresos.filter((ingreso) => (ingreso.descripcion || "").toLowerCase().includes(search.toLowerCase()));

  const handleEliminarIndividual = async (id) => {
    const confirmado = await showConfirm("¿Eliminar ingreso?", "No podrás recuperarlo después.");
    if (confirmado) await onDelete(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md group">
          <input type="text" placeholder="Buscar por descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-neutral-700 rounded-lg focus:ring-1 focus:ring-slate-300 dark:focus:ring-neutral-600 focus:border-slate-400 dark:focus:border-slate-500 text-sm bg-white dark:bg-neutral-800 dark:text-neutral-200 dark:placeholder-slate-500 transition-all shadow-sm" />
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-[20px]">search</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-neutral-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-neutral-400">Descripción</th>
              <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-semibold text-slate-500 dark:text-neutral-400">Enviado Por</th>
              <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-semibold text-slate-500 dark:text-neutral-400">Recibido Por</th>
              <th className="px-6 py-3 hidden sm:table-cell text-left text-xs font-semibold text-slate-500 dark:text-neutral-400">Fecha</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-neutral-400">Monto</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-neutral-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-neutral-800">
            {ingresosFiltrados.length === 0 ? (
              <tr><td colSpan="6" className="p-12 text-center text-slate-400 dark:text-neutral-500">No se encontraron registros</td></tr>
            ) : (
              ingresosFiltrados.map((ing) => (
                <tr key={ing.id} onClick={() => setIngresoSeleccionado(ing)} className="cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800 dark:text-neutral-100">{ing.descripcion || "Sin descripción"}</div>
                    <div className="text-xs text-slate-400 dark:text-neutral-500 sm:hidden mt-1">{formatearFecha(ing.fecha)}</div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-600 dark:text-neutral-300">{ing.enviadoPor?.nombre || <span className="text-slate-400 dark:text-neutral-500">—</span>}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-600 dark:text-neutral-300">{ing.recibidoPor?.nombre || <span className="text-slate-400 dark:text-neutral-500">—</span>}</td>
                  <td className="px-6 py-4 hidden sm:table-cell text-slate-600 dark:text-neutral-300">{formatearFecha(ing.fecha)}</td>
                  <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400 text-right">+${formatearMonto(ing.monto)}</td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(ing.id); }} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
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

      {ingresoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100 dark:border-neutral-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-neutral-700 flex justify-between items-start">
                <h3 className="text-base font-medium text-slate-800 dark:text-neutral-100">Detalle de Ingreso</h3>
                <button onClick={() => setIngresoSeleccionado(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-neutral-200 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-all"><span className="material-symbols-outlined text-xl block">close</span></button>
            </div>
            <div className="p-6 space-y-5">
                <div><p className="text-xs text-slate-400 font-medium mb-1">Descripción</p><p className="text-base text-slate-800 dark:text-neutral-100">{ingresoSeleccionado.descripcion}</p></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Fecha</p><p className="text-base font-medium text-slate-800 dark:text-neutral-100">{formatearFecha(ingresoSeleccionado.fecha)}</p></div>
                    <div><p className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Monto</p><p className="text-xl font-semibold text-green-700 dark:text-green-300">+${formatearMonto(ingresoSeleccionado.monto)}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Enviado Por</p><p className="text-base text-slate-800 dark:text-neutral-100">{ingresoSeleccionado.enviadoPor?.nombre || <span className="text-slate-400">—</span>}</p></div>
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Recibido Por</p><p className="text-base text-slate-800 dark:text-neutral-100">{ingresoSeleccionado.recibidoPor?.nombre || <span className="text-slate-400">—</span>}</p></div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
