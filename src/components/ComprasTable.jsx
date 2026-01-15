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
    } catch (error) {
      console.error(error);
    }
  };

  const handleEliminarIndividual = async (id) => {
    const confirmado = await showConfirm("¿Eliminar esta compra?", "Esta acción no se puede deshacer.");
    if (confirmado) await onDelete(id);
  };

  const comprasFiltradas = compras.filter((compra) =>
    (compra.nombre || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatearMoneda = (val) => Number(val || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const formatearFecha = (f) => { try { return new Date(f).toLocaleDateString("es-ES", {year:"numeric", month:"long", day:"numeric"}); } catch { return "--"; }};

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <input type="text" placeholder="Buscar por nombre..." className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          <span className="absolute right-3 top-2.5 text-gray-400 material-symbols-outlined">search</span>
        </div>
        {seleccionados.size > 0 && (
          <button onClick={handleEliminar} className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm flex justify-center items-center gap-2">
            <span className="material-symbols-outlined">delete</span> Eliminar ({seleccionados.size})
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 sm:px-6 py-3 w-8"><input type="checkbox" checked={comprasFiltradas.length > 0 && seleccionados.size === compras.length} onChange={toggleSeleccionarTodos} className="rounded" /></th>
              <th className="px-3 sm:px-6 py-3 text-left font-semibold text-gray-600 uppercase">Material / Detalle</th>
              <th className="px-3 sm:px-6 py-3 hidden md:table-cell font-semibold text-gray-600 uppercase">Categoría</th>
              <th className="px-3 sm:px-6 py-3 hidden lg:table-cell font-semibold text-gray-600 uppercase">Proveedor</th>
              <th className="px-3 sm:px-6 py-3 hidden md:table-cell text-center font-semibold text-gray-600 uppercase">Cant.</th>
              <th className="px-3 sm:px-6 py-3 hidden lg:table-cell text-right font-semibold text-gray-600 uppercase">Precio</th>
              <th className="px-3 sm:px-6 py-3 text-right font-semibold text-gray-600 uppercase">Total</th>
              <th className="px-3 sm:px-6 py-3 hidden sm:table-cell text-gray-600 uppercase">Fecha</th>
              <th className="px-3 sm:px-6 py-3 text-center text-gray-600 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comprasFiltradas.length === 0 ? <tr><td colSpan="9" className="p-8 text-center text-gray-500">No hay registros</td></tr> : 
            comprasFiltradas.map((compra) => (
              <tr key={compra.id} onClick={() => setCompraSeleccionada(compra)} className="border-b hover:bg-blue-50 cursor-pointer transition-colors">
                <td className="px-3 sm:px-6 py-3"><input type="checkbox" checked={seleccionados.has(compra.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSeleccionar(compra.id)} className="rounded" /></td>
                <td className="px-3 sm:px-6 py-3">
                    <div className="font-medium text-gray-900">{compra.nombre}</div>
                    <div className="text-xs text-gray-500 sm:hidden mt-1">{compra.cantidad} {compra.medida || 'u'} • {compra.categoriaNombre}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 hidden md:table-cell text-gray-700">{compra.categoriaNombre}</td>
                <td className="px-3 sm:px-6 py-3 hidden lg:table-cell text-gray-700">{compra.proveedorNombre || "--"}</td>
                <td className="px-3 sm:px-6 py-3 hidden md:table-cell text-center">{compra.cantidad}</td>
                <td className="px-3 sm:px-6 py-3 hidden lg:table-cell text-right">${formatearMoneda(compra.precioUnitario)}</td>
                <td className="px-3 sm:px-6 py-3 text-right font-bold text-red-600">${formatearMoneda(compra.montoTotal)}</td>
                <td className="px-3 sm:px-6 py-3 hidden sm:table-cell text-gray-700">{formatearFecha(compra.fechaCompra)}</td>
                <td className="px-3 sm:px-6 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button onClick={(e) => { e.stopPropagation(); onEdit(compra); }} className="text-blue-600 hover:bg-blue-100 p-2 rounded"><span className="material-symbols-outlined text-lg">edit</span></button>
                      <button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(compra.id); }} className="text-red-600 hover:bg-red-100 p-2 rounded"><span className="material-symbols-outlined text-lg">delete</span></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-3 border rounded-lg bg-white">
        <span className="text-sm text-gray-600">Mostrando {Math.min((paginaActual-1)*pageSize+1, totalItems)} a {Math.min(paginaActual*pageSize, totalItems)} de {totalItems}</span>
        <div className="flex gap-1">
            <button onClick={() => onChangePagina(paginaActual-1)} disabled={paginaActual===1} className="px-2 py-1 border rounded disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({length:totalPaginas},(_,i)=>i+1).map(p=>(<button key={p} onClick={()=>onChangePagina(p)} className={`w-8 h-8 rounded ${paginaActual===p?'bg-blue-600 text-white':'hover:bg-gray-100'}`}>{p}</button>))}
            <button onClick={() => onChangePagina(paginaActual+1)} disabled={paginaActual===totalPaginas} className="px-2 py-1 border rounded disabled:opacity-50"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>

      {/* MODAL DETALLE CORREGIDO */}
      {compraSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden relative animate-fade-in-up">
            
            {/* Header del Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">{compraSeleccionada.nombre}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {compraSeleccionada.categoriaNombre}
                    </span>
                </div>
                <button onClick={() => setCompraSeleccionada(null)} className="text-gray-400 hover:text-gray-600">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Contenido con Medida Separada */}
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Cantidad</p>
                        <p className="font-semibold text-gray-900 text-lg">{compraSeleccionada.cantidad}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Medida</p>
                        <p className="font-semibold text-gray-900 text-lg">{compraSeleccionada.medida || "---"}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Precio Unitario</p>
                        <p className="font-medium text-gray-700">${formatearMoneda(compraSeleccionada.precioUnitario)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold">Monto Total</p>
                        <p className="font-bold text-red-600 text-xl">${formatearMoneda(compraSeleccionada.montoTotal)}</p>
                    </div>
                </div>

                <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 uppercase font-bold">Proveedor</p>
                    <p className="text-gray-800 font-medium">{compraSeleccionada.proveedorNombre || "No especificado"}</p>
                </div>

                <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 uppercase font-bold">Fecha de Compra</p>
                    <p className="text-gray-800 font-medium">{formatearFecha(compraSeleccionada.fechaCompra)}</p>
                </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button onClick={() => setCompraSeleccionada(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}