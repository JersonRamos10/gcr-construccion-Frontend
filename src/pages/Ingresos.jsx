import { useState, useEffect, useRef } from "react";
import MainLayout from "../layouts/MainLayout";
import SummaryCards from "../components/SummaryCards";
import IncomeTable from "../components/IncomeTable";
import { getIngresos, createIngreso, deleteIngreso } from "../Api/ingresoApi";
import { showAlert } from "../utils/alerts"; 

export default function Ingresos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const tablaRef = useRef(null);

  // Estados del formulario
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Datos
  const [ingresos, setIngresos] = useState([]);
  const [resumenDatos, setResumenDatos] = useState({
    totalMes: "0.00", // Ahora será string formateado
    promedioPorProyecto: "0.00",
    ultimoIngreso: "--",
  });

  // Paginación y Filtros
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const pageSize = 5;

  // --- CALCULAR RESUMEN DEL MES ACTUAL (INDEPENDIENTE) ---
  const calcularResumenMesActual = async () => {
    try {
        const now = new Date();
        // Primer día del mes actual
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        // Último día del mes actual
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Pedimos TODOS los datos de este mes (usando un pageSize alto para traer todo)
        // NOTA: Si tienes muchos registros, esto debería paginarse en el back, pero para <100 funciona.
        const dataMes = await getIngresos(1, 1000, start, end);
        
        const itemsMes = dataMes.items || [];
        
        // Sumamos solo lo de este mes
        const total = itemsMes.reduce((sum, ing) => sum + (ing.monto || 0), 0);
        
        // Calculamos el promedio global (opcional: o solo del mes)
        // Para promedio general, mejor usar la data actual o una llamada global si existiera.
        // Aquí usaremos la data del mes para ser consistentes con "Promedio de este mes"
        const promedio = itemsMes.length > 0 ? total / itemsMes.length : 0;

        // Último ingreso real (ordenamos por fecha)
        const ordenados = [...itemsMes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const ultimo = ordenados[0];
        const fechaUltimo = ultimo ? new Date(ultimo.fecha).toLocaleDateString("es-ES") : "--";

        setResumenDatos({
            totalMes: total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            promedioPorProyecto: promedio.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            ultimoIngreso: fechaUltimo
        });

    } catch (error) {
        console.error("Error calculando resumen mensual:", error);
    }
  };

  const cargarIngresosTabla = async (page = 1) => {
    try {
      const data = await getIngresos(page, pageSize, fechaInicio, fechaFin);
      setIngresos(data.items || []);
      setPaginaActual(data.page || 1);
      setTotalPaginas(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("❌ Error cargando tabla:", error);
      setIngresos([]);
    }
  };

  const handleAplicarFiltro = async () => {
    await cargarIngresosTabla(1);
    if (tablaRef.current) {
        tablaRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    cargarIngresosTabla();
    calcularResumenMesActual(); // Se ejecuta al inicio para llenar las tarjetas
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
      
      // Actualizamos todo
      await cargarIngresosTabla(1);
      await calcularResumenMesActual();
      
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
      await cargarIngresosTabla(paginaActual);
      await calcularResumenMesActual();
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
            <button onClick={handleAplicarFiltro} className="w-full sm:w-auto h-10 px-4 sm:px-6 rounded-lg bg-blue-600 hover:bg-blue-700 font-medium text-white text-sm sm:text-base transition-colors">Aplicar</button>
          </div>

          <SummaryCards 
            totalMes={`$${resumenDatos.totalMes}`} 
            promedioPorProyecto={`$${resumenDatos.promedioPorProyecto}`} 
            ultimoIngreso={resumenDatos.ultimoIngreso} 
          />

          <div ref={tablaRef} className="scroll-mt-4">
             <IncomeTable ingresos={ingresos} paginaActual={paginaActual} totalPaginas={totalPaginas} totalItems={totalItems} onChangePagina={(p) => { if(p>=1 && p<=totalPaginas) cargarIngresosTabla(p)}} onDelete={handleEliminar} pageSize={pageSize} />
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