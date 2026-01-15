import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Necesario para los botones de acción rápida
import MainLayout from "../layouts/MainLayout";
import { showAlert } from "../utils/alerts"; // Usamos tu sistema de alertas

const API_URL = `${import.meta.env.VITE_API_URL}/api/dashboard/resumen`;

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);

  // Formatear moneda
  const formatearMoneda = (valor) => {
    if (valor === null || valor === undefined) return "0.00";
    const num = Number(valor);
    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const cargarResumen = async () => {
    try {
      setLoading(true);
      let url = API_URL;

      if (fechaInicio) url += `?fromDate=${fechaInicio}`;
      if (fechaFin) url += fechaInicio ? `&toDate=${fechaFin}` : `?toDate=${fechaFin}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

      const data = await response.json();
      setResumen(data);
    } catch (error) {
      console.error(error);
      showAlert("error", "Error al cargar el dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  // Cálculos auxiliares para la barra de progreso (Salud Financiera)
  const totalGastos = (resumen?.totalComprasMaterial || 0) + (resumen?.totalPagosEmpleados || 0);
  const totalIngresos = resumen?.totalIngresos || 0;
  const porcentajeGastado = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
  const porcentajeBarra = Math.min(porcentajeGastado, 100); // Tope visual 100%

  return (
    <MainLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        
        {/* 1. ENCABEZADO Y ACCIONES RÁPIDAS */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Panel de Control</h1>
            <p className="text-gray-500 mt-1">Bienvenido, al panel de control del estado financiero del proyecto.</p>
          </div>
          
          {/* Botones de Acción Rápida */}
          <div className="flex flex-wrap gap-3">
            <Link to="/compras" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium shadow-sm">
                <span className="material-symbols-outlined text-blue-600">shopping_cart</span>
                Nueva Compra
            </Link>
            <Link to="/ingresos" className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium shadow-md shadow-green-200">
                <span className="material-symbols-outlined">attach_money</span>
                Nuevo Ingreso
            </Link>
          </div>
        </div>

        {/* 2. FILTROS (Manteniendo tu lógica, mejorando visualmente) */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            <div className="w-full md:flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Desde</label>
              <input
                type="date"
                className="block w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="w-full md:flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Hasta</label>
              <input
                type="date"
                className="block w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <button
              onClick={cargarResumen}
              disabled={loading}
              className="w-full md:w-auto h-11 px-8 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold transition-colors shadow-lg disabled:opacity-50"
            >
              {loading ? "Actualizando..." : "Filtrar Resultados"}
            </button>
        </div>

        {/* 3. CAPITAL DISPONIBLE (HERO CARD) */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-xl text-white p-6 sm:p-10">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <p className="text-blue-100 font-medium mb-1 text-sm sm:text-base opacity-90">Capital Disponible Actual</p>
                    <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                        ${formatearMoneda(resumen?.capitalDisponible || 0)}
                    </h2>
                </div>
                <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
                    <span className="material-symbols-outlined text-4xl text-white">account_balance_wallet</span>
                </div>
            </div>
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 rounded-full bg-white/10 blur-2xl"></div>
        </div>

        {/* 4. BARRA DE SALUD FINANCIERA (Entradas vs Salidas) */}
        {resumen && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h3 className="text-gray-900 font-semibold">Flujo de Caja</h3>
                        <p className="text-xs text-gray-500">Relación Ingresos vs. Gastos Totales</p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{porcentajeGastado.toFixed(1)}% Gastado</span>
                </div>
                
                {/* Barra Fondo */}
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    {/* Barra Progreso */}
                    <div 
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            porcentajeGastado > 90 ? 'bg-red-500' : porcentajeGastado > 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${porcentajeBarra}%` }}
                    ></div>
                </div>
                
                <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                    <span>$0</span>
                    <span>Meta: No exceder Ingresos (${formatearMoneda(totalIngresos)})</span>
                </div>
            </div>
        )}

        {/* 5. GRID DE DETALLES (Tarjetas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Ingresos */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">trending_up</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Total Ingresos</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">${formatearMoneda(resumen?.totalIngresos || 0)}</p>
                <p className="text-xs text-green-600 mt-1 font-medium">+ Entradas registradas</p>
            </div>

            {/* Compras (Materiales) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">inventory_2</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Gasto Materiales</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">${formatearMoneda(resumen?.totalComprasMaterial || 0)}</p>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                    <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${totalGastos > 0 ? ((resumen?.totalComprasMaterial || 0) / totalGastos * 100) : 0}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Representa el {totalGastos > 0 ? ((resumen?.totalComprasMaterial || 0) / totalGastos * 100).toFixed(0) : 0}% de tus gastos</p>
            </div>

            {/* Pagos (Mano de Obra) */}
            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                        <span className="material-symbols-outlined text-2xl">engineering</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-500 uppercase">Mano de Obra</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">${formatearMoneda(resumen?.totalPagosEmpleados || 0)}</p>
                 <div className="w-full bg-gray-100 rounded-full h-1.5 mt-3">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${totalGastos > 0 ? ((resumen?.totalPagosEmpleados || 0) / totalGastos * 100) : 0}%` }}></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">Representa el {totalGastos > 0 ? ((resumen?.totalPagosEmpleados || 0) / totalGastos * 100).toFixed(0) : 0}% de tus gastos</p>
            </div>
        </div>

        {/* 6. RESUMEN TEXTUAL (Estilo Ticket/Factura) */}
        {resumen && (
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 border-dashed">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider">Detalle del Balance</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                        <span>Ingresos Totales</span>
                        <span className="font-medium text-gray-900">${formatearMoneda(resumen.totalIngresos)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>(-) Compras de Material</span>
                        <span className="font-medium text-red-600">-${formatearMoneda(resumen.totalComprasMaterial)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 pb-3 border-b border-gray-300 border-dashed">
                        <span>(-) Pagos de Nómina</span>
                        <span className="font-medium text-orange-600">-${formatearMoneda(resumen.totalPagosEmpleados)}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-1">
                        <span className="text-gray-800">Resultado Neto (Ganancia/Pérdida)</span>
                        <span className={(resumen.totalIngresos - totalGastos) >= 0 ? "text-green-600" : "text-red-600"}>
                            ${formatearMoneda(resumen.totalIngresos - totalGastos)}
                        </span>
                    </div>
                </div>
            </div>
        )}

      </div>
    </MainLayout>
  );
}