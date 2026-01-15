import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MainLayout({ children }) {
  const [menuAbierto, setMenuAbierto] = useState(false);

  const toggleMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col sm:flex-row">
      {/* Sidebar de Desktop */}
      <div className="hidden sm:block">
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
          <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg overflow-y-auto">
            <Sidebar cerrarMenu={cerrarMenu} />
          </div>
        </>
      )}

      <div className="flex-1 flex flex-col">
        <Navbar toggleMenu={toggleMenu} />

        <main className="flex-1 p-3 sm:p-4 lg:p-6">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
