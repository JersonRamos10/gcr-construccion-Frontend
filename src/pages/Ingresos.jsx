import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import IncomeTable from "../components/IncomeTable";
import { getIngresos, createIngreso, deleteIngreso } from "../Api/ingresoApi";

export default function Ingresos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // formulario
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [loading, setLoading] = useState(false);

  // datos
  const [ingresos, setIngresos] = useState([]);
  const [resumenDatos, setResumenDatos] = useState({
    totalMes: 0,
    promedioPorProyecto: 0,
    ultimoIngreso: "--",
  });

  // paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 5;

  // filtros
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // ==========================
  // CALCULAR DATOS DE RESUMEN
  // ==========================
  const calcularResumen = (ingresosList) => {
    if (!ingresosList || ingresosList.length === 0) {
      setResumenDatos({
        totalMes: 0,
        promedioPorProyecto: 0,
        ultimoIngreso: "--",
      });
      return;
    }

    // Total de ingresos
    const total = ingresosList.reduce((sum, ing) => sum + (ing.monto || 0), 0);

    // Promedio por proyecto
    const promedio = ingresosList.length > 0 ? total / ingresosList.length : 0;

    // Último ingreso (más reciente)
    const ultimoIngreso = ingresosList[0];
    const ultimaFecha = ultimoIngreso
      ? new Date(ultimoIngreso.fecha).toLocaleDateString("es-ES")
      : "--";

    setResumenDatos({
      totalMes: total.toFixed(2),
      promedioPorProyecto: promedio.toFixed(2),
      ultimoIngreso: ultimaFecha,
    });
  };

  // ==========================
  // CARGAR INGRESOS DESDE API
  // ==========================
  const cargarIngresos = async (page = 1) => {
    try {
      const data = await getIngresos(page, pageSize, fechaInicio, fechaFin);

      const ingresosList = data.items || [];
      setIngresos(ingresosList);
      setPaginaActual(data.page || 1);
      setTotalPaginas(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      calcularResumen(ingresosList);
    } catch (error) {
      console.error("❌ Error cargando ingresos:", error);
      setIngresos([]);
      setResumenDatos({
        totalMes: 0,
        promedioPorProyecto: 0,
        ultimoIngreso: "--",
      });
    }
  };

  useEffect(() => {
    cargarIngresos();
  }, []);

  // ==========================
  // CREAR INGRESO
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descripcion.trim() || !monto || !fecha) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      setLoading(true);
      const nuevoIngreso = await createIngreso({
        descripcion,
        monto: Number(monto),
        fecha,
      });

      console.log("✅ Ingreso creado:", nuevoIngreso);

      setDescripcion("");
      setMonto("");
      setFecha("");
      setMostrarFormulario(false);

      // Recargar la tabla (volver a página 1)
      await cargarIngresos(1);
      alert("✅ Ingreso registrado correctamente");
    } catch (error) {
      console.error("❌ Error al registrar ingreso:", error);
      alert("Error al registrar ingreso: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // FILTRAR POR FECHAS
  // ==========================
  const aplicarFiltroFechas = () => {
    setPaginaActual(1); // Reiniciar a página 1 cuando se aplica filtro
    cargarIngresos(1);
  };

  // ==========================
  // CAMBIAR PÁGINA
  // ==========================
  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      cargarIngresos(nuevaPagina);
    }
  };

  // ==========================
  // ELIMINAR INGRESO
  // ==========================
  const handleEliminar = async (id) => {
    try {
      await deleteIngreso(id);
      console.log("✅ Ingreso eliminado exitosamente");

      // Recargar la tabla
      await cargarIngresos(paginaActual);
    } catch (error) {
      console.error("❌ Error al eliminar ingreso:", error);
      throw error;
    }
  };

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-4 lg:px-6 mx-auto max-w-7xl py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
                Gestión de Ingresos
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mt-1">
                Administra y registra todos los ingresos financieros.
              </p>
            </div>

            <button
              onClick={() => setMostrarFormulario(true)}
              className="flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white h-11 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap"
              title="Agregar nuevo ingreso"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="hidden sm:inline">Registrar ingreso</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          </div>

        {/* FILTROS POR FECHA */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
            <div className="w-full sm:flex-1">
              <label className="text-xs font-medium text-gray-600">Desde</label>
              <input
                type="date"
                className="block w-full h-10 px-3 border border-gray-200 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="w-full sm:flex-1">
              <label className="text-xs font-medium text-gray-600">Hasta</label>
              <input
                type="date"
                className="block w-full h-10 px-3 border border-gray-200 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <button
              onClick={() => cargarIngresos(1)}
              className="w-full sm:w-auto h-10 px-4 sm:px-6 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-white text-sm sm:text-base transition-colors"
            >
              Aplicar
            </button>
          </div>

          {/* SUMMARY CARDS */}
          <SummaryCards
            totalMes={`$${Number(resumenDatos.totalMes).toLocaleString("es-ES")}`}
            promedioPorProyecto={`$${Number(resumenDatos.promedioPorProyecto).toLocaleString("es-ES")}`}
            ultimoIngreso={resumenDatos.ultimoIngreso}
          />

          {/* TABLA REAL */}
          <IncomeTable 
            ingresos={ingresos} 
            paginaActual={paginaActual}
            totalPaginas={totalPaginas}
            totalItems={totalItems}
            onChangePagina={cambiarPagina}
            onDelete={handleEliminar}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* OVERLAY */}
      {mostrarFormulario && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"></div>
      )}

      {/* FORMULARIO LATERAL */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l transform transition-transform duration-300 z-50
        ${mostrarFormulario ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 h-full flex flex-col bg-white">
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h3 className="text-2xl font-bold text-gray-800">Nuevo Ingreso</h3>
            <button 
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-500 hover:text-gray-700 transition-colors p-1"
              title="Cerrar formulario"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto">
            <div>
              <label className="block mb-3 font-semibold text-gray-700">Monto</label>
              <input
                type="number"
                placeholder="Ingresa el monto"
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 focus:border-green-400 focus:outline-none transition-colors bg-gray-50"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block mb-3 font-semibold text-gray-700">Fecha</label>
              <input
                type="date"
                className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 focus:border-green-400 focus:outline-none transition-colors bg-gray-50"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block mb-3 font-semibold text-gray-700">Descripción</label>
              <textarea
                className="w-full p-4 rounded-lg border-2 border-gray-300 focus:border-green-400 focus:outline-none transition-colors bg-gray-50 resize-none"
                rows="4"
                placeholder="Describe el ingreso"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
              />
            </div>

            <div className="pt-6 border-t flex gap-3">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="flex-1 h-12 rounded-lg bg-white border-2 border-primary text-primary font-bold hover:bg-green-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 h-12 rounded-lg bg-green-400 hover:bg-green-500 font-bold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
