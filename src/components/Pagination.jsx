/**
 * Genera un array de números de página con "..." cuando hay saltos.
 * Siempre muestra: primera, última, y una ventana alrededor de la página activa.
 */
function getPageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }

  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}

/**
 * Componente de paginación reutilizable con ventana deslizante.
 * Funciona bien en móviles y escritorio.
 */
export default function Pagination({ paginaActual, totalPaginas, totalItems, pageSize, onChangePagina }) {
  const pages = getPageNumbers(paginaActual, totalPaginas);

  const inicio = Math.min((paginaActual - 1) * pageSize + 1, totalItems);
  const fin = Math.min(paginaActual * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center pt-2 gap-3">
      <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        Viendo {inicio} – {fin} de {totalItems} resultados
      </span>

      <div className="flex items-center gap-1">
        {/* Anterior */}
        <button
          onClick={() => onChangePagina(paginaActual - 1)}
          disabled={paginaActual === 1}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-40 disabled:shadow-none text-slate-600 dark:text-slate-300 transition-all bg-slate-50 dark:bg-slate-800"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        {/* Números */}
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm select-none"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onChangePagina(p)}
              className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                paginaActual === p
                  ? "bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-md"
                  : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm border border-transparent hover:border-slate-200 dark:hover:border-slate-600"
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Siguiente */}
        <button
          onClick={() => onChangePagina(paginaActual + 1)}
          disabled={paginaActual === totalPaginas}
          className="w-9 h-9 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm disabled:opacity-40 disabled:shadow-none text-slate-600 dark:text-slate-300 transition-all bg-slate-50 dark:bg-slate-800"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
