import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import PagosTable from "../components/PagosTable";
import { getPagos, createPago, deletePago } from "../Api/pagoApi";
import { getEmpleados } from "../Api/empleadoApi"; // Reutilizamos la API de empleados

const pageSize = 5;

export default function PagosManoObra() {
  // --- Estados de Datos ---
  const [pagos, setPagos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  
  // --- Estados de Formulario ---
  const [mostrarForm, setMostrarForm] = useState(false);
  const [empleadoSeleccionadoId, setEmpleadoSeleccionadoId] = useState("");
  const [diasTrabajados, setDiasTrabajados] = useState("6"); // Por defecto semana completa
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  
  // --- Estados de Filtros ---
  const [filtroEmpleado, setFiltroEmpleado] = useState("");
  const [filtroFechaInicio, setFiltroFechaInicio] = useState("");
  const [filtroFechaFin, setFiltroFechaFin] = useState("");

  // --- Paginación ---
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar Empleados (para el Select y Filtros)
  useEffect(() => {
    async function loadEmpleados() {
      try {
        const data = await getEmpleados();
        setEmpleados(data);
      } catch (error) {
        console.error("Error cargando empleados para lista desplegable", error);
      }
    }
    loadEmpleados();
  }, []);

  // Cargar Pagos (cuando cambian filtros o página)
  useEffect(() => {
    cargarPagos();
  }, [paginaActual]); // Los filtros se aplican con botón, no automático para evitar re-render excesivo

  const cargarPagos = async (page = paginaActual) => {
    setLoading(true);
    try {
      const data = await getPagos(
        page, 
        pageSize, 
        filtroEmpleado || null, 
        filtroFechaInicio, 
        filtroFechaFin
      );
      
      setPagos(data.items || []);
      setPaginaActual(data.page);
      setTotalPaginas(data.totalPages);
      setTotalItems(data.totalItems);
    } catch (error) {
      alert("Error cargando el historial de pagos", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Lógica de Creación ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!empleadoSeleccionadoId) return alert("Selecciona un empleado");
    if (diasTrabajados < 1 || diasTrabajados > 6) return alert("Días deben ser entre 1 y 6");

    try {
      await createPago({
        empleadoId: parseInt(empleadoSeleccionadoId),
        diasTrabajados: parseInt(diasTrabajados),
        fechaPago: fechaPago
      });
      
      setMostrarForm(false);
      resetForm();
      cargarPagos(1); // Recargar primera página
    } catch (error) {
      alert(error.message);
    }
  };

  const resetForm = () => {
    setEmpleadoSeleccionadoId("");
    setDiasTrabajados("6");
    setFechaPago(new Date().toISOString().split('T')[0]);
  };

  const handleDelete = async (id) => {
    if(!confirm("¿Eliminar este registro de pago?")) return;
    try {
        await deletePago(id);
        cargarPagos(paginaActual);
    } catch (error) {
        alert(error.message);
    }
  };

  // --- Cálculo en Tiempo Real (Vista Previa) ---
  const empleadoObj = empleados.find(e => e.id === parseInt(empleadoSeleccionadoId));
  const totalEstimado = empleadoObj 
    ? (empleadoObj.pagoPorDia * diasTrabajados).toFixed(2) 
    : "0.00";

  return (
    <MainLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100">Planilla de Obra</h1>
                <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">Registra los pagos semanales o diarios del personal.</p>
            </div>
            <button
                onClick={() => setMostrarForm(!mostrarForm)}
                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
            >
                <span className="material-symbols-outlined">{mostrarForm ? "close" : "payments"}</span>
                {mostrarForm ? "Cancelar" : "Registrar Pago"}
            </button>
        </div>

        {/* Formulario de Registro */}
        {mostrarForm && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-lg animate-fade-in-down">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-slate-100">Nuevo Pago</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Select Empleado */}
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Empleado</label>
                        <select
                            className="w-full border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
                            value={empleadoSeleccionadoId}
                            onChange={(e) => setEmpleadoSeleccionadoId(e.target.value)}
                            required
                        >
                            <option value="">-- Seleccione --</option>
                            {empleados.map(emp => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.nombreCompleto} (${emp.pagoPorDia}/día)
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Días Trabajados */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Días Trabajados (1-6)</label>
                        <select
                             className="w-full border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg shadow-sm p-2 border"
                             value={diasTrabajados}
                             onChange={(e) => setDiasTrabajados(e.target.value)}
                        >
                            {[1,2,3,4,5,6].map(d => (
                                <option key={d} value={d}>{d} {d === 1 ? 'día' : 'días'}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha Pago */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Fecha de Pago</label>
                        <input
                            type="date"
                            className="w-full border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg shadow-sm p-2 border"
                            value={fechaPago}
                            onChange={(e) => setFechaPago(e.target.value)}
                            required
                        />
                    </div>

                    {/* Tarjeta de Resumen en Vivo */}
                    <div className="sm:col-span-2 bg-gray-50 dark:bg-slate-800 p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border border-gray-200 dark:border-slate-700">
                        <div className="text-sm text-gray-600 dark:text-slate-300">
                            {empleadoObj ? (
                                <span>Calculando: <strong>${empleadoObj.pagoPorDia}</strong> x <strong>{diasTrabajados} días</strong></span>
                            ) : "Seleccione un empleado para calcular"}
                        </div>
                        <div className="text-xl font-bold text-blue-600 mt-2 sm:mt-0">
                            Total a Pagar: ${totalEstimado}
                        </div>
                    </div>

                    <div className="sm:col-span-2 flex justify-end">
                        <button type="submit" className="w-full sm:w-auto bg-green-600 text-white px-6 py-2.5 rounded-lg hover:bg-green-700 font-medium shadow-sm">
                            Confirmar Pago
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* Filtros */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Filtrar por Empleado</label>
                <select
                    className="w-full mt-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtroEmpleado}
                    onChange={(e) => setFiltroEmpleado(e.target.value)}
                >
                    <option value="">Todos los empleados</option>
                    {empleados.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.nombreCompleto}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Desde</label>
                <input 
                    type="date" 
                    className="w-full mt-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtroFechaInicio}
                    onChange={(e) => setFiltroFechaInicio(e.target.value)}
                />
            </div>
            <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Hasta</label>
                <input 
                    type="date" 
                    className="w-full mt-1 border border-gray-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filtroFechaFin}
                    onChange={(e) => setFiltroFechaFin(e.target.value)}
                />
            </div>
            </div>
            <div className="flex justify-end">
            <button 
                onClick={() => cargarPagos(1)}
                className="w-full sm:w-auto bg-gray-800 dark:bg-slate-700 text-white px-6 py-2.5 rounded-lg hover:bg-gray-900 dark:hover:bg-slate-600 text-sm font-medium transition-colors"
            >
                Filtrar
            </button>
            </div>
        </div>

        {/* Tabla de Resultados */}
        {loading ? (
             <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
             </div>
        ) : (
            <PagosTable 
                pagos={pagos}
                paginaActual={paginaActual}
                totalPaginas={totalPaginas}
                totalItems={totalItems}
                onChangePagina={cargarPagos}
                onDelete={handleDelete}
                pageSize={pageSize}
            />
        )}
      </div>
    </MainLayout>
  );
}