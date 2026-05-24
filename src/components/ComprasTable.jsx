import { useState } from "react";
import { showConfirm, showAlert } from "../utils/alerts";
import Pagination from "./Pagination";

export default function ComprasTable({
  compras,
  paginaActual,
  totalPaginas,
  totalItems,
  onChangePagina,
  onDelete,
  onEdit,
  pageSize,
}) {
  const [search, setSearch] = useState("");
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const handleEliminarIndividual = async (id) => {
    const confirmado = await showConfirm("Eliminar compra?", "Esta accion no se puede deshacer.");
    if (confirmado) await onDelete(id);
  };

  const comprasFiltradas = compras.filter((compra) => (compra.nombre || "").toLowerCase().includes(search.toLowerCase()));
  const formatearMoneda = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatearFecha = (f) => { try { return new Date(f).toLocaleDateString("es-ES", {year:"numeric", month:"short", day:"numeric"}); } catch { return "--"; }};

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md group">
          <input 
            type="text" 
            placeholder="Buscar material..." 
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-600 focus:border-slate-400 dark:focus:border-slate-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 transition-all shadow-sm" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">search</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Material</th>
              <th className="px-6 py-3 hidden md:table-cell text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Categoria</th>
              <th className="px-6 py-3 hidden lg:table-cell text-left text-xs font-semibold text-slate-500 dark:text-slate-400">Proveedor</th>
              <th className="px-6 py-3 hidden md:table-cell text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Cant.</th>
              <th className="px-6 py-3 hidden lg:table-cell text-right text-xs font-semibold text-slate-500 dark:text-slate-400">Precio</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">Total</th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {comprasFiltradas.length === 0 ? (
              <tr><td colSpan="7" className="p-12 text-center text-slate-400 dark:text-slate-500">No se encontraron resultados</td></tr>
            ) : (
              comprasFiltradas.map((compra) => (
                <tr key={compra.id} onClick={() => setCompraSeleccionada(compra)} className="cursor-pointer">
                  <td className="px-6 py-4">
                      <div className="font-medium text-slate-800 dark:text-slate-100">{compra.nombre}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden mt-1">{compra.cantidad} {compra.medida} - {compra.categoriaNombre}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 hidden sm:block">{formatearFecha(compra.fechaCompra)}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell text-slate-600 dark:text-slate-300">{compra.categoriaNombre}</td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-600 dark:text-slate-300">{compra.proveedorNombre || "-"}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-center text-slate-800 dark:text-slate-200">{compra.cantidad} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">{compra.medida}</span></td>
                  <td className="px-6 py-4 hidden lg:table-cell text-right text-slate-600 dark:text-slate-300">${formatearMoneda(compra.precioUnitario)}</td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900 dark:text-white">${formatearMoneda(compra.montoTotal)}</td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(compra); }} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                        <button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(compra.id); }} className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                      </div>
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

      {compraSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start">
                <div>
                    <h3 className="text-base font-medium text-slate-800 dark:text-slate-100">{compraSeleccionada.nombre}</h3>
                    <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">{compraSeleccionada.categoriaNombre}</span>
                </div>
                <button onClick={() => setCompraSeleccionada(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"><span className="material-symbols-outlined text-xl block">close</span></button>
            </div>
            <div className="p-6 space-y-5">
                <div className="grid grid-cols-2 gap-4">
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Cantidad</p><p className="text-lg font-medium text-slate-800 dark:text-slate-100">{compraSeleccionada.cantidad} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{compraSeleccionada.medida}</span></p></div>
                    <div><p className="text-xs text-slate-400 font-medium mb-1">Precio Unit.</p><p className="text-lg font-medium text-slate-800 dark:text-slate-100">${formatearMoneda(compraSeleccionada.precioUnitario)}</p></div>
                </div>
                <div className="text-center py-3">
                    <p className="text-xs text-slate-400 font-medium mb-1">Costo Total</p>
                    <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">${formatearMoneda(compraSeleccionada.montoTotal)}</p>
                </div>
                <div className="space-y-3 pt-2 px-1">
                    <div className="flex justify-between text-sm border-b border-dashed border-slate-200 dark:border-slate-700 pb-2"><span className="text-slate-500 dark:text-slate-400">Proveedor</span><span className="font-medium text-slate-700 dark:text-slate-200">{compraSeleccionada.proveedorNombre || "---"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Fecha Adquisicion</span><span className="font-medium text-slate-700 dark:text-slate-200">{formatearFecha(compraSeleccionada.fechaCompra)}</span></div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
