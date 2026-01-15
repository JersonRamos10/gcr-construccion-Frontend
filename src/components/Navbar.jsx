export default function Navbar({ toggleMenu }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        {/* Botón hamburguesa (solo en móvil) */}
        <button
          onClick={toggleMenu}
          className="sm:hidden text-gray-700 hover:text-blue-600 transition-colors p-2"
          title="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Dashboard financiero
        </h1>
      </div>

      <span className="text-xs sm:text-sm text-gray-500">
        Sistema de gestión de construcción
      </span>
    </header>
  );
}
