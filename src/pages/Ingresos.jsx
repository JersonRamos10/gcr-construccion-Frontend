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
    totalMes: "0.00",
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

  // --- CALCULAR RESUMEN ---
  const calcularResumenMesActual = async () => {
    try {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const dataMes = await getIngresos(1, 1000, start, end);
        const itemsMes = dataMes.items || [];
        const total = itemsMes.reduce((sum, ing) => sum + (ing.monto || 0), 0);
        const promedio = itemsMes.length > 0 ? total / itemsMes.length : 0;
        const ordenados = [...itemsMes].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        const ultimo = ordenados[0];
        // Ajuste de fecha local para visualización
        const fechaUltimo = ultimo ? new Date(ultimo.fecha).toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' }) : "--";

        setResumenDatos({
            totalMes: total.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            promedioPorProyecto: promedio.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            ultimoIngreso: fechaUltimo
        });
    } catch (error) { console.error(error); }
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
    calcularResumenMesActual(); 
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

  const limpiarFormulario = () => {
    setDescripcion(""); setMonto(""); setFecha(""); setErrors({});
    setMostrarFormulario(false);
  }

  // Estilo Pasivo (Igual que Compras)
  const inputClass = (error) => `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-slate-700 bg-white shadow-sm ${error ? "border-red-300 focus:ring-red-100 focus:border-red-400 bg-red-50" : "border-slate-200 focus:ring-green-100 focus:border-green-400 hover:border-slate-300"}`;

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-4 lg:px-6 mx-auto max-w-7xl py-6 sm:py-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Gestión de Ingresos</h1>
            <p className="text-slate-500 text-sm mt-1">Control de entradas financieras y abonos.</p>
          </div>
          <button
            onClick={() => { if(mostrarFormulario) limpiarFormulario(); else setMostrarFormulario(true); }}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all transform active:scale-95 ${mostrarFormulario ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'}`}
          >
            <span className="material-symbols-outlined">{mostrarFormulario ? "close" : "add"}</span>
            <span>{mostrarFormulario ? "Cancelar Registro" : "Nuevo Ingreso"}</span>
          </button>
        </div>

        {/* FORMULARIO INLINE (Igual que Compras) */}
        {mostrarFormulario && (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-100 animate-fade-in-down relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-600">attach_money</span>
                    Registrar Entrada de Dinero
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Monto <span className="text-red-400">*</span></label>
                        <input type="number" placeholder="0.00" className={inputClass(errors.monto)} value={monto} onChange={(e) => setMonto(e.target.value)} step="0.01" min="0" />
                        {errors.monto && <p className="text-xs text-red-500 mt-1 font-medium">{errors.monto}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fecha <span className="text-red-400">*</span></label>
                        <input type="date" className={inputClass(errors.fecha)} value={fecha} onChange={(e) => setFecha(e.target.value)} />
                        {errors.fecha && <p className="text-xs text-red-500 mt-1 font-medium">{errors.fecha}</p>}
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Descripción / Concepto <span className="text-red-400">*</span></label>
                        <textarea className={`${inputClass(errors.descripcion)} h-auto py-3 resize-none`} rows="3" placeholder="Ej. Anticipo Proyecto X..." value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                        {errors.descripcion && <p className="text-xs text-red-500 mt-1 font-medium">{errors.descripcion}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                    <button type="button" onClick={limpiarFormulario} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
                    <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-100 transition-all disabled:opacity-50">
                        {loading ? "Guardando..." : "Guardar Ingreso"}
                    </button>
                </div>
            </form>
        )}

        <SummaryCards 
            totalMes={`$${resumenDatos.totalMes}`} 
            promedioPorProyecto={`$${resumenDatos.promedioPorProyecto}`} 
            ultimoIngreso={resumenDatos.ultimoIngreso} 
        />

        {/* BARRA DE FILTROS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-end">
            <div className="w-full md:flex-1 grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Desde</label>
                    <input type="date" className="block w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Hasta</label>
                    <input type="date" className="block w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-green-100 focus:border-green-400 outline-none" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
                </div>
            </div>
            <button onClick={handleAplicarFiltro} className="w-full md:w-auto h-[42px] px-8 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200">
                Filtrar Resultados
            </button>
        </div>

        <div ref={tablaRef} className="scroll-mt-4">
           <IncomeTable ingresos={ingresos} paginaActual={paginaActual} totalPaginas={totalPaginas} totalItems={totalItems} onChangePagina={(p) => { if(p>=1 && p<=totalPaginas) cargarIngresosTabla(p)}} onDelete={handleEliminar} pageSize={pageSize} />
        </div>
      </div>
    </MainLayout>
  );
}