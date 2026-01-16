import { useState } from "react";
import { showConfirm, showAlert } from "../utils/alerts";

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
    const confirmado = await showConfirm(
      "¿Eliminar compras seleccionadas?", 
      `Se eliminarán ${seleccionados.size} registros permanentemente.`
    );
    if (!confirmado) return;

    try {
      for (const id of seleccionados) await onDelete(id);
      setSeleccionados(new Set());
    } catch (error) { console.error(error); }
  };

  const handleEliminarIndividual = async (id) => {
    const confirmado = await showConfirm("¿Eliminar esta compra?", "Esta acción no se puede deshacer.");
    if (confirmado) await onDelete(id);
  };

  // Filtrado local (solo página actual)
  const comprasFiltradas = compras.filter((compra) =>
    (compra.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatearMoneda = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatearFecha = (f) => { try { return new Date(f).toLocaleDateString("es-ES", {year:"numeric", month:"short", day:"numeric"}); } catch { return "--"; }};

  return (
    <div className="space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-lg">
        <div className="relative flex-1 w-full max-w-md">
          <input 
            type="text" 
            placeholder="Buscar en esta página..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50 focus:bg-white transition-colors" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
          <span className="absolute left-3 top-2.5 text-gray-400 material-symbols-outlined text-lg">search</span>
        </div>
        {seleccionados.size > 0 && (
          <button onClick={handleEliminar} className="w-full sm:w-auto px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-medium rounded-lg text-sm flex justify-center items-center gap-2 transition-colors border border-red-200">
            <span className="material-symbols-outlined text-lg">delete</span> Eliminar ({seleccionados.size})
          </button>
        )}
      </div>

      {/* Tabla con Nuevo Diseño */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 w-8">
                <input type="checkbox" checked={comprasFiltradas.length > 0 && seleccionados.size === compras.length} onChange={toggleSeleccionarTodos} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Material</th>
              <th className="px-6 py-4 hidden md:table-cell text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-4 hidden lg:table-cell text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Proveedor</th>
              <th className="px-6 py-4 hidden md:table-cell text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Cant.</th>
              <th className="px-6 py-4 hidden lg:table-cell text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Precio U.</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {comprasFiltradas.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-gray-400">No hay registros en esta página</td></tr>
            ) : (
              comprasFiltradas.map((compra) => (
                <tr key={compra.id} onClick={() => setCompraSeleccionada(compra)} className={`hover:bg-gray-50 cursor-pointer transition-colors ${seleccionados.has(compra.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-6 py-4"><input type="checkbox" checked={seleccionados.has(compra.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSeleccionar(compra.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" /></td>
                  <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{compra.nombre}</div>
                      <div className="text-xs text-gray-500 sm:hidden mt-1">{compra.cantidad} {compra.medida} • {compra.categoriaNombre}</div>
                      <div className="text-xs text-gray-400 hidden sm:block mt-0.5">{formatearFecha(compra.fechaCompra)}</div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        {compra.categoriaNombre}
                      </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-600">{compra.proveedorNombre || "-"}</td>
                  <td className="px-6 py-4 hidden md:table-cell text-center text-gray-900 font-medium">
                    {compra.cantidad} <span className="text-gray-400 text-xs font-normal">{compra.medida}</span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-right text-gray-600 font-mono text-xs">${formatearMoneda(compra.precioUnitario)}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">${formatearMoneda(compra.montoTotal)}</td>
                  <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); onEdit(compra); }} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                        <button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(compra.id); }} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                      </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <span className="text-sm text-gray-500 mb-2 sm:mb-0">Mostrando {Math.min((paginaActual-1)*pageSize+1, totalItems)} - {Math.min(paginaActual*pageSize, totalItems)} de {totalItems}</span>
        <div className="flex gap-1">
            <button onClick={() => onChangePagina(paginaActual-1)} disabled={paginaActual===1} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-600"><span className="material-symbols-outlined text-sm align-middle">chevron_left</span></button>
            {Array.from({length:totalPaginas},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>onChangePagina(p)} className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${paginaActual===p?'bg-gray-900 text-white':'hover:bg-gray-100 text-gray-600 border border-gray-200'}`}>{p}</button>
            ))}
            <button onClick={() => onChangePagina(paginaActual+1)} disabled={paginaActual===totalPaginas} className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 text-gray-600"><span className="material-symbols-outlined text-sm align-middle">chevron_right</span></button>
        </div>
      </div>

      {/* MODAL DETALLE */}
      {compraSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{compraSeleccionada.nombre}</h3>
                    <div className="flex gap-2 mt-2">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">{compraSeleccionada.categoriaNombre}</span>
                        {compraSeleccionada.medida && <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">{compraSeleccionada.medida}</span>}
                    </div>
                </div>
                <button onClick={() => setCompraSeleccionada(null)} className="text-gray-400 hover:text-gray-600 bg-white rounded-full p-1 border border-gray-200 hover:border-gray-300 transition-colors"><span className="material-symbols-outlined text-xl block">close</span></button>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Cantidad</p><p className="text-xl font-semibold text-gray-900">{compraSeleccionada.cantidad}</p></div>
                    <div><p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Precio Unitario</p><p className="text-xl font-medium text-gray-900">${formatearMoneda(compraSeleccionada.precioUnitario)}</p></div>
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs text-blue-500 uppercase font-bold tracking-wider mb-1">Monto Total</p>
                    <p className="text-3xl font-bold text-blue-700">${formatearMoneda(compraSeleccionada.montoTotal)}</p>
                </div>
                <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Proveedor</span><span className="font-medium text-gray-900">{compraSeleccionada.proveedorNombre || "---"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Fecha de Compra</span><span className="font-medium text-gray-900">{formatearFecha(compraSeleccionada.fechaCompra)}</span></div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}