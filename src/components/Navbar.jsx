import { useTheme } from "../context/ThemeContext";

export default function Navbar({ toggleMenu }) {
  const { dark, toggleDark } = useTheme();

  return (
    <header className="bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-700 px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        {/* Botón hamburguesa (solo en móvil) */}
        <button
          onClick={toggleMenu}
          className="sm:hidden text-gray-700 dark:text-neutral-300 hover:text-blue-600 transition-colors p-2"
          title="Abrir menú"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard financiero
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs sm:text-sm text-gray-500 dark:text-neutral-400">
          Sistema de gestión de construcción
        </span>

        {/* Botón Dark / Light */}
        <button
          onClick={toggleDark}
          title={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 dark:border-neutral-600 bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-neutral-700 transition-all shadow-sm"
        >
          <span className="material-symbols-outlined text-[20px]">
            {dark ? "light_mode" : "dark_mode"}
          </span>
        </button>
      </div>
    </header>
  );
}
