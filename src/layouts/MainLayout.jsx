import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950">
      {/* Sidebar de Desktop (fijo, full height) */}
      <div className="hidden sm:block fixed inset-y-0 left-0 w-64 z-30">
        <Sidebar cerrarMenu={cerrarMenu} />
      </div>

      {/* Sidebar móvil (modal) */}
      {menuAbierto && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={cerrarMenu}
          />
          {/* Menu slide-in */}
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-neutral-900 shadow-lg overflow-y-auto">
            <Sidebar cerrarMenu={cerrarMenu} />
          </div>
        </>
      )}

      {/* Contenido principal (con margen izquierdo para el sidebar fijo) */}
      <div className="sm:ml-64 flex flex-col min-h-screen">
        <Navbar toggleMenu={toggleMenu} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
