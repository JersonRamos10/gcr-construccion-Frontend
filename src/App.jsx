import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Ingresos from "./pages/Ingresos";
import Compras from "./pages/Compras";
import Pagos from "./pages/Pagos";
import Empleados from "./pages/Empleados";
import Servicios from "./pages/Servicios";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ingresos" element={<Ingresos />} />
      <Route path="/compras" element={<Compras />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/empleados" element={<Empleados />} />
      <Route path="/servicios" element={<Servicios />} />

      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  );
}
