import { NavLink } from "react-router-dom";

export default function Sidebar({ cerrarMenu }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 sm:px-4 py-3 rounded text-sm sm:text-base transition-colors ${
      isActive
        ? "bg-blue-100 text-blue-700 font-bold"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  const handleNavClick = () => {
    if (cerrarMenu) cerrarMenu();
  };

  return (
    <aside className="w-full sm:w-64 bg-white border-b sm:border-b-0 sm:border-r border-gray-200">
      <div className="p-4 sm:p-6 font-bold text-lg sm:text-xl text-blue-600 flex items-center justify-between">
        <span>GCR Construcción</span>
        {/* Botón cerrar (solo visible en móvil) */}
        {cerrarMenu && (
          <button
            onClick={cerrarMenu}
            className="sm:hidden text-gray-500 hover:text-gray-700"
            title="Cerrar menú"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      <nav className="px-3 sm:px-4 space-y-1">
        <NavLink to="/dashboard" className={linkClass} onClick={handleNavClick}>
          <span className="material-symbols-outlined text-base flex-shrink-0">dashboard</span>
          <span>Resumen</span>
        </NavLink>

        <NavLink to="/ingresos" className={linkClass} onClick={handleNavClick}>
          <span className="material-symbols-outlined text-base flex-shrink-0">trending_up</span>
          <span>Ingresos</span>
        </NavLink>

        <NavLink to="/compras" className={linkClass} onClick={handleNavClick}>
          <span className="material-symbols-outlined text-base flex-shrink-0">shopping_cart</span>
          <span>Compras</span>
        </NavLink>

        <NavLink to="/pagos" className={linkClass} onClick={handleNavClick}>
          <span className="material-symbols-outlined text-base flex-shrink-0">payment</span>
          <span>Pagos</span>
        </NavLink>

        <NavLink to="/empleados" className={linkClass} onClick={handleNavClick}>
          <span className="material-symbols-outlined text-base flex-shrink-0">group</span>
          <span>Empleados</span>
        </NavLink>
      </nav>
    </aside>
  );
}
