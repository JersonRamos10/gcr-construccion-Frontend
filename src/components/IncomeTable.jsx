import { useState } from "react";
import { showConfirm, showAlert } from "../utils/alerts";

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

  const handleEliminar = async () => {
    if (seleccionados.size === 0) return showAlert("warning", "Selecciona al menos un ingreso");
    const confirmado = await showConfirm("¿Eliminar seleccionados?", `Se borrarán ${seleccionados.size} registros.`);
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
    <div className="space-y-5">
      {/* Barra de Búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md group">
          <input type="text" placeholder="Buscar por descripción..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-100 focus:border-slate-400 text-sm bg-white transition-all shadow-sm group-hover:border-slate-300" />
          <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-400 text-[20px]">search</span>
        </div>
        {seleccionados.size > 0 && (
          <button onClick={handleEliminar} className="px-5 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl text-sm flex items-center gap-2 transition-colors border border-red-100">
            <span className="material-symbols-outlined text-[18px]">delete</span> Eliminar ({seleccionados.size})
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 w-10 text-center"><input type="checkbox" checked={ingresosFiltrados.length > 0 && seleccionados.size === ingresosFiltrados.length} onChange={toggleSeleccionarTodos} className="rounded border-slate-300 text-slate-800 focus:ring-slate-200 cursor-pointer" /></th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Descripción</th>
              <th className="px-6 py-4 hidden sm:table-cell text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Monto</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ingresosFiltrados.length === 0 ? (
              <tr><td colSpan="5" className="p-12 text-center text-slate-400 font-medium">No se encontraron registros</td></tr>
            ) : (
              ingresosFiltrados.map((ing) => (
                <tr key={ing.id} onClick={() => setIngresoSeleccionado(ing)} className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${seleccionados.has(ing.id) ? 'bg-blue-50/50' : ''}`}>
                  <td className="px-6 py-4 text-center"><input type="checkbox" checked={seleccionados.has(ing.id)} onClick={(e) => e.stopPropagation()} onChange={() => toggleSeleccionar(ing.id)} className="rounded border-slate-300 text-slate-800 focus:ring-slate-200 cursor-pointer" /></td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{ing.descripcion || "Sin descripción"}</div>
                    <div className="text-xs text-slate-400 sm:hidden mt-1">{formatearFecha(ing.fecha)}</div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell text-slate-600 font-medium">{formatearFecha(ing.fecha)}</td>
                  <td className="px-6 py-4 font-bold text-green-600 text-right text-base">+${formatearMonto(ing.monto)}</td>
                  <td className="px-6 py-4 text-center">
                      <button onClick={(e) => { e.stopPropagation(); handleEliminarIndividual(ing.id); }} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-2">
        <span className="text-sm text-slate-500 font-medium">Viendo {Math.min((paginaActual - 1) * pageSize + 1, totalItems)} a {Math.min(paginaActual * pageSize, totalItems)} de {totalItems}</span>
        <div className="flex gap-2 mt-3 sm:mt-0">
            <button onClick={() => onChangePagina(paginaActual - 1)} disabled={paginaActual === 1} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:shadow-none text-slate-600 transition-all bg-slate-50"><span className="material-symbols-outlined text-lg">chevron_left</span></button>
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
                <button key={page} onClick={() => onChangePagina(page)} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${paginaActual === page ? "bg-slate-800 text-white shadow-md" : "text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200"}`}>{page}</button>
            ))}
            <button onClick={() => onChangePagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-40 disabled:shadow-none text-slate-600 transition-all bg-slate-50"><span className="material-symbols-outlined text-lg">chevron_right</span></button>
        </div>
      </div>

      {/* Modal Detalle (Estilo Coherente) */}
      {ingresoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up border border-slate-100">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Detalle de Ingreso</h3>
                <button onClick={() => setIngresoSeleccionado(null)} className="text-slate-400 hover:text-slate-600 bg-white rounded-full p-1.5 shadow-sm border border-slate-100 hover:border-slate-300 transition-all"><span className="material-symbols-outlined text-xl block">close</span></button>
            </div>
            <div className="p-6 space-y-6">
                <div><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">Descripción</p><p className="text-lg font-medium text-slate-800">{ingresoSeleccionado.descripcion}</p></div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100"><p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Fecha</p><p className="text-base font-bold text-slate-800">{formatearFecha(ingresoSeleccionado.fecha)}</p></div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100"><p className="text-xs text-green-600 uppercase font-bold tracking-wider mb-1">Monto</p><p className="text-xl font-bold text-green-700">+${formatearMonto(ingresoSeleccionado.monto)}</p></div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}