import { useState } from "react";

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
  const [eliminando, setEliminando] = useState(false);
  
  // Nuevo estado para el modal de detalles
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "--";
    try {
      const fecha = new Date(fechaStr);
      return fecha.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return fechaStr;
    }
  };

  // Formatear monto
  const formatearMonto = (monto) => {
    if (monto === null || monto === undefined) return "0.00";
    const num = Number(monto);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Filtrar ingresos por búsqueda
  const ingresosFiltrados = ingresos.filter((ingreso) => {
    const desc = (ingreso.descripcion || "").toLowerCase();
    return desc.includes(search.toLowerCase());
  });

  // Manejar selección individual
  const toggleSeleccionar = (id) => {
    const nuevoSet = new Set(seleccionados);
    if (nuevoSet.has(id)) {
      nuevoSet.delete(id);
    } else {
      nuevoSet.add(id);
    }
    setSeleccionados(nuevoSet);
  };

  // Seleccionar/deseleccionar todos
  const toggleSeleccionarTodos = () => {
    if (seleccionados.size === ingresosFiltrados.length) {
      setSeleccionados(new Set());
    } else {
      setSeleccionados(new Set(ingresosFiltrados.map(ing => ing.id)));
    }
  };

  // Eliminar ingresos seleccionados
  const handleEliminar = async () => {
    if (seleccionados.size === 0) {
      alert("Selecciona al menos un ingreso para eliminar");
      return;
    }

    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar ${seleccionados.size} ingreso(s)?`);
    if (!confirmacion) return;

    try {
      setEliminando(true);
      for (const id of seleccionados) {
        await onDelete(id);
      }
      setSeleccionados(new Set());
    } catch (error) {
      console.error("❌ Error al eliminar ingresos:", error);
      alert("Error al eliminar algunos ingresos");
    } finally {
      setEliminando(false);
    }
  };

  // Eliminar un ingreso individual
  const handleEliminarIndividual = async (id) => {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este ingreso?");
    if (!confirmacion) return;

    try {
      setEliminando(true);
      await onDelete(id);
      setSeleccionados(prev => {
        const nuevo = new Set(prev);
        nuevo.delete(id);
        return nuevo;
      });
    } catch (error) {
      console.error("❌ Error al eliminar ingreso:", error);
      alert("Error al eliminar el ingreso");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Barra de búsqueda y acciones */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <input
            type="text"
            placeholder="Buscar por descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <span className="material-symbols-outlined absolute right-3 top-2.5 text-gray-400 text-lg">search</span>
        </div>

        {seleccionados.size > 0 && (
          <button
            onClick={handleEliminar}
            disabled={eliminando}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center sm:justify-start gap-2"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            <span className="hidden sm:inline">Eliminar ({seleccionados.size})</span>
            <span className="sm:hidden">Eliminar</span>
          </button>
        )}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-lg sm:rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 sm:px-6 py-3 text-left w-8">
                <input 
                  type="checkbox" 
                  checked={ingresosFiltrados.length > 0 && seleccionados.size === ingresosFiltrados.length}
                  onChange={toggleSeleccionarTodos}
                  className="w-4 h-4 cursor-pointer rounded"
                />
              </th>
              
              {/* Descripción ahora es la columna principal visible siempre */}
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Descripción / Fecha
              </th>
              
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">
                Fecha
              </th>
              
              <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Monto
              </th>
              
              <th className="px-3 sm:px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {ingresosFiltrados.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-3 sm:px-6 py-8 text-center text-gray-500 text-sm">
                  No hay ingresos registrados que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              ingresosFiltrados.map((ingreso) => (
                <tr 
                  key={ingreso.id} 
                  onClick={() => setIngresoSeleccionado(ingreso)}
                  className={`border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer ${seleccionados.has(ingreso.id) ? 'bg-blue-50' : ''}`}
                >
                  <td className="px-3 sm:px-6 py-4 align-top sm:align-middle">
                    <input 
                      type="checkbox" 
                      checked={seleccionados.has(ingreso.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleSeleccionar(ingreso.id)}
                      className="w-4 h-4 cursor-pointer rounded mt-1 sm:mt-0"
                    />
                  </td>
                  
                  {/* Columna Principal: Descripción + Fecha en móvil */}
                  <td className="px-3 sm:px-6 py-4 text-sm">
                    <div className="font-medium text-gray-900">
                      {ingreso.descripcion || "Sin descripción"}
                    </div>
                    {/* Detalles solo visibles en móvil */}
                    <div className="text-xs text-gray-500 sm:hidden mt-1 flex flex-col gap-0.5">
                       <span>{formatearFecha(ingreso.fecha)}</span>
                       <span className="text-blue-600 text-[10px] mt-1 font-medium">
                            Tocar para ver detalles
                       </span>
                    </div>
                  </td>
                  
                  {/* Columna Fecha: Oculta en móvil */}
                  <td className="px-3 sm:px-6 py-4 text-gray-700 whitespace-nowrap hidden sm:table-cell">
                    {formatearFecha(ingreso.fecha)}
                  </td>
                  
                  <td className="px-3 sm:px-6 py-4 font-bold text-green-600 text-right align-top sm:align-middle">
                    +${formatearMonto(ingreso.monto)}
                  </td>
                  
                  <td className="px-3 sm:px-6 py-4 text-center align-top sm:align-middle">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEliminarIndividual(ingreso.id);
                      }}
                      disabled={eliminando}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl bg-white">
        <span className="text-xs sm:text-sm text-gray-600">
          Mostrando {Math.min((paginaActual - 1) * pageSize + 1, totalItems)} a{" "}
          {Math.min(paginaActual * pageSize, totalItems)} de {totalItems}
        </span>

        <div className="flex gap-1 sm:gap-2 flex-wrap">
          <button
            onClick={() => onChangePagina(paginaActual - 1)}
            disabled={paginaActual === 1}
            className="px-2 sm:px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onChangePagina(page)}
                className={`px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors ${
                  paginaActual === page
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onChangePagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
            className="px-2 sm:px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>

      {/* --- MODAL DE DETALLE DE INGRESO --- */}
      {ingresoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up">
            
            {/* Header del Modal */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-start">
                <h3 className="text-lg font-bold text-gray-900">Detalle del Ingreso</h3>
                <button 
                    onClick={() => setIngresoSeleccionado(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-5">
                
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Descripción</p>
                    <p className="text-gray-900 font-medium text-lg leading-snug">
                        {ingresoSeleccionado.descripcion || "Sin descripción"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Fecha</p>
                        <p className="text-gray-900 font-medium">
                            {formatearFecha(ingresoSeleccionado.fecha)}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Monto Total</p>
                        <p className="text-green-600 font-bold text-xl">
                            +${formatearMonto(ingresoSeleccionado.monto)}
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-gray-50 px-6 py-3 flex justify-end">
                <button
                    onClick={() => setIngresoSeleccionado(null)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                    Cerrar
                </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}