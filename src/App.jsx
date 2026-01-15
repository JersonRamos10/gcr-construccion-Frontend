import { Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Ingresos from "./pages/Ingresos";
import Compras from "./pages/Compras";
import Pagos from "./pages/Pagos";
import Empleados from "./pages/Empleados";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/ingresos" element={<Ingresos />} />
      <Route path="/compras" element={<Compras />} />
      <Route path="/pagos" element={<Pagos />} />
      <Route path="/empleados" element={<Empleados />} />

      <Route path="*" element={<h1>404 - Página no encontrada</h1>} />
    </Routes>
  );
}
