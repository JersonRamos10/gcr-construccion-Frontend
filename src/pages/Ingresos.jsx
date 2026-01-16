import { useState, useEffect, useRef } from "react"; // 1. IMPORTAR useRef
import MainLayout from "../layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import IncomeTable from "../components/IncomeTable";
import { getIngresos, createIngreso, deleteIngreso } from "../Api/ingresoApi";
import { showAlert } from "../utils/alerts"; 

export default function Ingresos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  
  // Referencia para el scroll
  const tablaRef = useRef(null); // 2. CREAR REFERENCIA

  // Estados del formulario
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Datos
  const [ingresos, setIngresos] = useState([]);
  const [resumenDatos, setResumenDatos] = useState({
    totalMes: 0,
    promedioPorProyecto: 0,
    ultimoIngreso: "--",
  });

  // Paginación y Filtros
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const pageSize = 5;

  const calcularResumen = (ingresosList) => {
    if (!ingresosList || ingresosList.length === 0) {
      setResumenDatos({ totalMes: 0, promedioPorProyecto: 0, ultimoIngreso: "--" });
      return;
    }
    const total = ingresosList.reduce((sum, ing) => sum + (ing.monto || 0), 0);
    const promedio = ingresosList.length > 0 ? total / ingresosList.length : 0;
    
    // Ordenamos para encontrar la fecha más reciente real, por si la API no lo hace
    const ingresosOrdenados = [...ingresosList].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    const ultimoIngreso = ingresosOrdenados[0];
    const ultimaFecha = ultimoIngreso ? new Date(ultimoIngreso.fecha).toLocaleDateString("es-ES") : "--";

    setResumenDatos({
      totalMes: total.toFixed(2),
      promedioPorProyecto: promedio.toFixed(2), // Aquí podrías cambiar la etiqueta visual en el componente SummaryCards
      ultimoIngreso: ultimaFecha,
    });
  };

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
    }
  };

  // 3. NUEVA FUNCIÓN PARA APLICAR FILTRO CON SCROLL
  const handleAplicarFiltro = async () => {
    await cargarIngresos(1);
    // Hacemos scroll suave hacia la tabla
    if (tablaRef.current) {
        tablaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    cargarIngresos();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!monto || Number(monto) <= 0) newErrors.monto = "Ingresa un monto válido mayor a 0.";
    if (!fecha) newErrors.fecha = "La fecha es obligatoria.";
    if (!descripcion.trim()) newErrors.descripcion = "La descripción es obligatoria.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        showAlert("error", "Por favor completa los campos requeridos.");
        return;
    }
    try {
      setLoading(true);
      await createIngreso({ descripcion, monto: Number(monto), fecha });
      showAlert("success", "Ingreso registrado correctamente");
      setDescripcion(""); setMonto(""); setFecha(""); setErrors({});
      setMostrarFormulario(false);
      await cargarIngresos(1);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Error al registrar";
      showAlert("error", msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id) => {
    try {
      await deleteIngreso(id);
      await cargarIngresos(paginaActual);
      showAlert("success", "Ingreso eliminado");
    } catch (error) {
      showAlert("error", "No se pudo eliminar el ingreso");
    }
  };

  const inputClass = (hasError) => `
    w-full h-12 px-4 rounded-lg border-2 transition-colors focus:outline-none 
    ${hasError ? "border-red-400 bg-red-50 focus:border-red-500 placeholder-red-300" : "border-gray-300 bg-gray-50 focus:border-green-400"}
  `;

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-4 lg:px-6 mx-auto max-w-7xl py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">Gestión de Ingresos</h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mt-1">Administra y registra todos los ingresos financieros.</p>
            </div>
            <button
              onClick={() => { setMostrarFormulario(true); setErrors({}); }}
              className="flex items-center justify-center sm:justify-start gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white h-11 px-4 sm:px-6 font-medium text-sm sm:text-base transition-colors whitespace-nowrap"
            >
              <span className="material-symbols-outlined">add</span>
              <span className="hidden sm:inline">Registrar ingreso</span>
              <span className="sm:hidden">Agregar</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end bg-white p-4 sm:p-5 rounded-lg sm:rounded-xl border border-gray-200">
            <div className="w-full sm:flex-1">
              <label className="text-xs font-medium text-gray-600">Desde</label>
              <input type="date" className="block w-full h-10 px-3 border border-gray-200 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
            </div>
            <div className="w-full sm:flex-1">
              <label className="text-xs font-medium text-gray-600">Hasta</label>
              <input type="date" className="block w-full h-10 px-3 border border-gray-200 rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
            </div>
            {/* 4. ACTUALIZAR BOTÓN PARA USAR LA NUEVA FUNCIÓN */}
            <button onClick={handleAplicarFiltro} className="w-full sm:w-auto h-10 px-4 sm:px-6 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-white text-sm sm:text-base transition-colors">Aplicar</button>
          </div>

          <SummaryCards 
            totalMes={`$${Number(resumenDatos.totalMes).toLocaleString("es-ES")}`} 
            promedioPorProyecto={`$${Number(resumenDatos.promedioPorProyecto).toLocaleString("es-ES")}`} 
            ultimoIngreso={resumenDatos.ultimoIngreso} 
          />

          {/* 5. AGREGAR LA REF AL CONTENEDOR DE LA TABLA */}
          <div ref={tablaRef} className="scroll-mt-4">
             <IncomeTable ingresos={ingresos} paginaActual={paginaActual} totalPaginas={totalPaginas} totalItems={totalItems} onChangePagina={(p) => { if(p>=1 && p<=totalPaginas) cargarIngresos(p)}} onDelete={handleEliminar} pageSize={pageSize} />
          </div>
        </div>
      </div>

      {mostrarFormulario && <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setMostrarFormulario(false)}></div>}

      <div className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl border-l transform transition-transform duration-300 z-50 ${mostrarFormulario ? "translate-x-0" : "translate-x-full"}`}>
        <div className="p-6 h-full flex flex-col bg-white">
          <div className="flex justify-between items-center mb-8 pb-4 border-b">
            <h3 className="text-2xl font-bold text-gray-800">Nuevo Ingreso</h3>
            <button onClick={() => setMostrarFormulario(false)} className="text-gray-500 hover:text-gray-700 transition-colors p-1"><span className="material-symbols-outlined text-2xl">close</span></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-1 overflow-y-auto">
            <div>
              <label className="block mb-3 font-semibold text-gray-700">Monto <span className="text-red-500">*</span></label>
              <input type="number" placeholder="Ingresa el monto" className={inputClass(errors.monto)} value={monto} onChange={(e) => setMonto(e.target.value)} step="0.01" min="0" />
              {errors.monto && <p className="text-red-500 text-xs mt-1">{errors.monto}</p>}
            </div>
            <div>
              <label className="block mb-3 font-semibold text-gray-700">Fecha <span className="text-red-500">*</span></label>
              <input type="date" className={inputClass(errors.fecha)} value={fecha} onChange={(e) => setFecha(e.target.value)} />
              {errors.fecha && <p className="text-red-500 text-xs mt-1">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block mb-3 font-semibold text-gray-700">Descripción <span className="text-red-500">*</span></label>
              <textarea className={`${inputClass(errors.descripcion)} h-auto py-3 resize-none`} rows="4" placeholder="Describe el ingreso" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
              {errors.descripcion && <p className="text-red-500 text-xs mt-1">{errors.descripcion}</p>}
            </div>
            <div className="pt-6 border-t flex gap-3">
              <button type="button" onClick={() => setMostrarFormulario(false)} className="flex-1 h-12 rounded-lg bg-white border-2 border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors">Cancelar</button>
              <button type="submit" disabled={loading} className="flex-1 h-12 rounded-lg bg-green-500 hover:bg-green-600 font-bold text-white transition-colors disabled:opacity-50 shadow-lg shadow-green-200">{loading ? "Guardando..." : "Guardar"}</button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}