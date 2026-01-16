import { useState } from "react";
import { showConfirm, showAlert } from "../utils/alerts"; // IMPORTAR

export default function IncomeTable({ 
  ingresos = [], 
  paginaActual = 1, 
  totalPaginas = 1, 
  totalItems = 0, 
  onChangePagina = () => {}, 
  onDelete = () => {}, 
  pageSize = 5 
}) {
  const [search, setSearch] = useState("");
  const [seleccionados, setSeleccionados] = useState(new Set());
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);

  // Formatear
  const formatearFecha = (f) => { try { return new Date(f).toLocaleDateString("es-ES", {year:"numeric", month:"short", day:"numeric"}); } catch { return "--"; }};
  const formatearMonto = (m) => Number(m || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const ingresosFiltrados = ingresos.filter((ingreso) => (ingreso.descripcion || "").toLowerCase().includes(search.toLowerCase()));

  const toggleSeleccionar = (id) => {
    const newSet = new Set(seleccionados);
    newSet.has(id) ? newSet.delete(id) : newSet.add(id);
    setSeleccionados(newSet);
  };

  const toggleSeleccionarTodos = () => {
    setSeleccionados(seleccionados.size === ingresosFiltrados.length ? new Set() : new Set(ingresosFiltrados.map(i => i.id)));
  };

  // --- ELIMINACIÓN CON SWEETALERT ---
  const handleEliminar = async () => {
    if (seleccionados.size === 0) return showAlert("warning", "Selecciona al menos un ingreso");
    
    const confirmado = await showConfirm(
        "¿Eliminar seleccionados?", 
        `Se borrarán ${seleccionados.size} ingresos permanentemente.`
    );
    
    if (!confirmado) return;

    try {
      for (const id of seleccionados) await onDelete(id);
      setSeleccionados(new Set());
    } catch (e) { console.error(e); }
  };

  const handleEliminarIndividual = async (id) => {
    const confirmado = await showConfirm("¿Eliminar ingreso?", "No podrás recuperarlo después.");
    if (confirmado) await onDelete(id);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Barra superior */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <input type="text" placeholder="Buscar por descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 text-lg">search</span>
        </div>
        {seleccionados.size > 0 && (
          <button onClick={handleEliminar} className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">delete</span> Eliminar ({seleccionados.size})
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left w-8"><input type="checkbox" checked={ingresosFiltrados.length > 0 && seleccionados.size === ingresosFiltrados.length} onChange={toggleSeleccionarTodos} className="w-4 h-4 cursor-pointer rounded" /></th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Descripción / Fecha</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Fecha</th>
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Monto</th>
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ingresosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="px-3 sm:px-6 py-8 text-center text-gray-500 text-sm">No hay ingresos registrados que coincidan.</td></tr>
            ) : (
              ingresosFiltrados.map((ing) => (
                <tr key={ing.id} onClick={() => setIngresoSeleccionado(ing)} className={`border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${seleccionados.has(ing.id) ? 'bg-blue-50' : ''}`}>
                  <td className="px-3 sm:px-6 py-4 align-top sm:align-middle"><input type="checkbox" checked={seleccionados.has(ing.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSeleccionar(ing.id)} className="w-4 h-4 cursor-pointer rounded mt-1 sm:mt-0" /></td>
                  <td className="px-3 sm:px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">{ing.descripcion || "Sin descripción"}</div>
                    <div className="text-xs text-gray-500 sm:hidden mt-1 flex flex-col gap-0.5"><span>{formatearFecha(ing.fecha)}</span><span className="text-blue-600 text-[10px] mt-1 font-medium">Tocar para ver detalles</span></div>
                  </td>
                  <td className="px-3 sm:px-6 py-4 text-gray-700 hidden sm:table-cell">{formatearFecha(ing.fecha)}</td>
                  <td className="px-3 sm:px-6 py-4 font-bold text-green-600 text-right">+${formatearMonto(ing.monto)}</td>
                  <td className="px-3 sm:px-6 py-4 text-center"><button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(ing.id); }} className="text-red-600 hover:text-red-700 p-2 rounded"><span className="material-symbols-outlined text-lg">delete</span></button></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 border border-gray-200 rounded-lg bg-white">
        <span className="text-xs sm:text-sm text-gray-600">Mostrando {Math.min((paginaActual - 1) * pageSize + 1, totalItems)} a {Math.min(paginaActual * pageSize, totalItems)} de {totalItems}</span>
        <div className="flex gap-1">
            <button onClick={() => onChangePagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-2 py-1 border rounded disabled:opacity-50"><span className="material-symbols-outlined">chevron_left</span></button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => onChangePagina(page)} className={`w-8 h-8 rounded ${paginaActual === page ? "bg-blue-600 text-white" : "hover:bg-gray-100"}`}>{page}</button>))}
            <button onClick={() => onChangePagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-2 py-1 border rounded disabled:opacity-50"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>

      {/* Modal Detalle */}
      {ingresoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between"><h3 className="text-lg font-bold">Detalle</h3><button onClick={() => setIngresoSeleccionado(null)} className="text-gray-400"><span className="material-symbols-outlined">close</span></button></div>
            <div className="p-6 space-y-4">
                <div><p className="text-xs text-gray-500 uppercase font-bold">Descripción</p><p className="text-lg font-medium">{ingresoSeleccionado.descripcion}</p></div>
                <div className="grid grid-cols-2 pt-4 border-t">
                    <div><p className="text-xs text-gray-500 uppercase font-bold">Fecha</p><p>{formatearFecha(ingresoSeleccionado.fecha)}</p></div>
                    <div><p className="text-xs text-gray-500 uppercase font-bold">Monto</p><p className="text-green-600 font-bold text-xl">+${formatearMonto(ingresoSeleccionado.monto)}</p></div>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 flex justify-end"><button onClick={() => setIngresoSeleccionado(null)} className="px-4 py-2 border rounded bg-white text-sm hover:bg-gray-50">Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  );
}