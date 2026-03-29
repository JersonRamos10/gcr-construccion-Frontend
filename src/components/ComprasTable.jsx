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
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [compraSeleccionada, setCompraSeleccionada] = useState(null);

  const toggleSeleccionar = (id) => {
    const nuevoSet = new Set(seleccionados);
    nuevoSet.has(id) ? nuevoSet.delete(id) : nuevoSet.add(id);
    setSeleccionados(nuevoSet);
  };

  const toggleSeleccionarTodos = () => {
    setSeleccionados(seleccionados.size === compras.length ? new Set() : new Set(compras.map((c) => c.id)));
  };

  const handleEliminar = async () => {
    if (seleccionados.size === 0) return showAlert("warning", "Selecciona al menos una compra");
    const confirmado = await showConfirm("Eliminar seleccionados?", `Se borraran ${seleccionados.size} registros.`);
    if (!confirmado) return;
    try {
      for (const id of seleccionados) await onDelete(id);
      setSeleccionados(new Set());
    } catch (error) { console.error(error); }
  };

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
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-slate-100 dark:focus:ring-slate-700 focus:border-slate-400 dark:focus:border-slate-500 text-sm bg-white dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 transition-all shadow-sm group-hover:border-slate-300 dark:group-hover:border-slate-600" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <span className="absolute left-3.5 top-2.5 text-slate-400 material-symbols-outlined text-[20px]">search</span>
        </div>
        {seleccionados.size > 0 && (
          <button onClick={handleEliminar} className="px-5 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors border border-red-100 dark:border-red-800">
            <span className="material-symbols-outlined text-[18px]">delete</span> Eliminar ({seleccionados.size})
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 w-10 text-center"><input type="checkbox" checked={comprasFiltradas.length > 0 && seleccionados.size === compras.length} onChange={toggleSeleccionarTodos} className="rounded border-slate-300 dark:border-slate-600 text-slate-800 dark:bg-slate-700 focus:ring-slate-200 cursor-pointer" /></th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Material</th>
              <th className="px-6 py-4 hidden md:table-cell text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
              <th className="px-6 py-4 hidden lg:table-cell text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-4 hidden md:table-cell text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Cant.</th>
              <th className="px-6 py-4 hidden lg:table-cell text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {comprasFiltradas.length === 0 ? (
              <tr><td colSpan="8" className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">No se encontraron resultados</td></tr>
            ) : (
              comprasFiltradas.map((compra) => (
                <tr key={compra.id} onClick={() => setCompraSeleccionada(compra)} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${seleccionados.has(compra.id) ? "bg-blue-50/50 dark:bg-blue-900/20" : ""}`}>
                  <td className="px-6 py-4 text-center"><input type="checkbox" checked={seleccionados.has(compra.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSeleccionar(compra.id)} className="rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-slate-800 focus:ring-slate-200 cursor-pointer" /></td>
                  <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-100 text-base">{compra.nombre}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 sm:hidden mt-1">{compra.cantidad} {compra.medida} - {compra.categoriaNombre}</div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-0.5 hidden sm:block">{formatearFecha(compra.fechaCompra)}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell"><span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">{compra.categoriaNombre}</span></td>
                  <td className="px-6 py-4 hidden lg:table-cell text-slate-600 dark:text-slate-300 font-medium">{compra.proveedorNombre || "-"}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-center text-slate-800 dark:text-slate-200 font-bold">{compra.cantidad} <span className="text-slate-400 dark:text-slate-500 font-normal text-xs">{compra.medida}</span></td>
                  <td className="px-6 py-4 hidden lg:table-cell text-right text-slate-600 dark:text-slate-300">${formatearMoneda(compra.precioUnitario)}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 dark:text-white">${formatearMoneda(compra.montoTotal)}</td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(compra); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                        <button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(compra.id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100 dark:border-slate-700">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{compraSeleccionada.nombre}</h3>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">{compraSeleccionada.categoriaNombre}</span>
                    </div>
                </div>
                <button onClick={() => setCompraSeleccionada(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-white dark:bg-slate-800 rounded-full p-1.5 shadow-sm border border-slate-100 dark:border-slate-600 hover:border-slate-300 transition-all"><span className="material-symbols-outlined text-xl block">close</span></button>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Cantidad</p><p className="text-xl font-bold text-slate-800 dark:text-slate-100">{compraSeleccionada.cantidad} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{compraSeleccionada.medida}</span></p></div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700"><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Precio Unit.</p><p className="text-xl font-bold text-slate-800 dark:text-slate-100">${formatearMoneda(compraSeleccionada.precioUnitario)}</p></div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-xl border border-blue-100 dark:border-blue-800 text-center">
                    <p className="text-xs text-blue-500 dark:text-blue-400 uppercase font-bold tracking-wider mb-1">Costo Total</p>
                    <p className="text-3xl font-black text-blue-900 dark:text-blue-200 tracking-tight">${formatearMoneda(compraSeleccionada.montoTotal)}</p>
                </div>
                <div className="space-y-3 pt-2 px-1">
                    <div className="flex justify-between text-sm border-b border-dashed border-slate-200 dark:border-slate-700 pb-2"><span className="text-slate-500 dark:text-slate-400">Proveedor</span><span className="font-semibold text-slate-700 dark:text-slate-200">{compraSeleccionada.proveedorNombre || "---"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 dark:text-slate-400">Fecha Adquisicion</span><span className="font-semibold text-slate-700 dark:text-slate-200">{formatearFecha(compraSeleccionada.fechaCompra)}</span></div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
