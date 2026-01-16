import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ComprasTable from "../components/ComprasTable";
import ComprasSummaryCards from "../components/ComprasSummaryCards";
import { getCompras, createCompra, deleteCompra, updateCompra } from "../Api/compraApi";
import { showAlert } from "../utils/alerts";

const pageSize = 5;

export default function Compras() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  
  // Campos del formulario
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioUnitario, setPrecioUnitario] = useState("");
  const [fechaCompra, setFechaCompra] = useState("");
  const [categoriaNombre, setCategoriaNombre] = useState("");
  const [medida, setMedida] = useState("");
  
  // Proveedor
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [proveedorTelefono, setProveedorTelefono] = useState("");
  const [proveedorDireccion, setProveedorDireccion] = useState("");
  const [mostrarDetallesProveedor, setMostrarDetallesProveedor] = useState(false);

  const [errors, setErrors] = useState({});

  // Datos
  const [compras, setCompras] = useState([]);
  const [resumenDatos, setResumenDatos] = useState({ 
    total: "0.00", 
    promedioPorCompra: "0.00", 
    ultimaCompraMonto: "0.00",
    ultimaCompraFecha: "--" 
  });
  
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // FILTROS
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  const [mesSeleccionado, setMesSeleccionado] = useState("");

  const formatearMoneda = (valor) => {
    if (valor === null || valor === undefined) return "0.00";
    return Number(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatearFechaCorta = (fecha) => {
    if (!fecha) return "--";
    // Forzamos la interpretación local para evitar desfases de zona horaria
    const dateObj = new Date(fecha);
    return dateObj.toLocaleDateString("es-ES", { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const calcularResumenTotal = async () => {
    try {
      // FIX: Pedimos una página muy grande (10000) para asegurar que tenemos TODO el historial
      // y así poder encontrar realmente la compra más reciente, no solo la de la página 1.
      const data = await getCompras(1, 10000, "", "");
      const allCompras = data.items || [];
      
      if (allCompras.length === 0) {
        setResumenDatos({ total: "0.00", promedioPorCompra: "0.00", ultimaCompraMonto: "0.00", ultimaCompraFecha: "--" });
        return;
      }

      // 1. Total Gasto
      const total = allCompras.reduce((sum, compra) => sum + (compra.montoTotal || 0), 0);
      
      // 2. Ordenar por fecha REAL descendente
      const comprasOrdenadas = [...allCompras].sort((a, b) => new Date(b.fechaCompra) - new Date(a.fechaCompra));
      
      // Tomamos la primera (la más reciente)
      const ultima = comprasOrdenadas[0];

      setResumenDatos({
        total: formatearMoneda(total),
        promedioPorCompra: formatearMoneda(total / allCompras.length),
        ultimaCompraMonto: formatearMoneda(ultima?.montoTotal || 0),
        ultimaCompraFecha: formatearFechaCorta(ultima?.fechaCompra),
      });
    } catch (error) {
      console.error("Error calculando resumen:", error);
    }
  };

  const cargarCompras = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getCompras(page, pageSize, fechaInicio, fechaFin);
      setCompras(data.items || []);
      setPaginaActual(data.page || 1);
      setTotalPaginas(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error(error);
      setCompras([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMesChange = (e) => {
    const mes = e.target.value;
    setMesSeleccionado(mes);

    if (mes === "") {
        setFechaInicio("");
        setFechaFin("");
    } else {
        const yearActual = new Date().getFullYear();
        const mesIndex = parseInt(mes);
        const primerDia = new Date(yearActual, mesIndex, 1);
        const ultimoDia = new Date(yearActual, mesIndex + 1, 0);
        
        // Ajuste de zona horaria para inputs type="date"
        const offset = primerDia.getTimezoneOffset() * 60000;
        setFechaInicio(new Date(primerDia.getTime() - offset).toISOString().split('T')[0]);
        setFechaFin(new Date(ultimoDia.getTime() - offset).toISOString().split('T')[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre es obligatorio.";
    if (!categoriaNombre.trim()) newErrors.categoriaNombre = "La categoría es obligatoria.";
    if (!cantidad || Number(cantidad) <= 0) newErrors.cantidad = "Cantidad inválida.";
    if (!precioUnitario || Number(precioUnitario) <= 0) newErrors.precioUnitario = "Precio inválido.";
    if (!fechaCompra) newErrors.fechaCompra = "La fecha es requerida.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        showAlert("error", "Por favor corrige los errores del formulario.");
        return;
    }

    try {
      const compraData = {
        nombre,
        cantidad: parseInt(cantidad),
        precioUnitario: parseFloat(precioUnitario),
        fechaCompra: fechaCompra + "T00:00:00",
        categoriaNombre,
        proveedorNombre: proveedorNombre || "",
        proveedorTelefono: proveedorTelefono || null,
        proveedorDireccion: proveedorDireccion || null,
        medida: medida || null,
      };

      if (editandoId) {
        await updateCompra(editandoId, compraData);
        showAlert("success", "Compra actualizada correctamente");
      } else {
        await createCompra(compraData);
        showAlert("success", "Compra registrada exitosamente");
      }
      limpiarFormulario();
      await cargarCompras(1);
      await calcularResumenTotal();
    } catch (error) {
      const msg = error.message || "Ocurrió un error al guardar";
      showAlert("error", msg);
    }
  };

  const limpiarFormulario = () => {
    setNombre(""); setCantidad(""); setPrecioUnitario(""); setFechaCompra("");
    setCategoriaNombre(""); setProveedorNombre(""); setProveedorTelefono("");
    setProveedorDireccion(""); setMedida(""); setMostrarDetallesProveedor(false);
    setErrors({}); setEditandoId(null); setMostrarFormulario(false);
  };

  const handleEditar = (compra) => {
    setEditandoId(compra.id);
    setNombre(compra.nombre);
    setCantidad(compra.cantidad.toString());
    setPrecioUnitario(compra.precioUnitario.toString());
    setFechaCompra(compra.fechaCompra.split("T")[0]);
    setCategoriaNombre(compra.categoriaNombre);
    setProveedorNombre(compra.proveedorNombre || "");
    setMedida(compra.medida || "");
    
    if (compra.proveedorTelefono || compra.proveedorDireccion) {
        setProveedorTelefono(compra.proveedorTelefono || "");
        setProveedorDireccion(compra.proveedorDireccion || "");
        setMostrarDetallesProveedor(true);
    } else {
        setProveedorTelefono("");
        setProveedorDireccion("");
        setMostrarDetallesProveedor(false);
    }
    
    setErrors({});
    setMostrarFormulario(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEliminar = async (id) => {
    try {
      await deleteCompra(id);
      await cargarCompras(paginaActual);
      await calcularResumenTotal();
      showAlert("success", "Compra eliminada");
    } catch (error) {
      showAlert("error", "Error al eliminar: " + error.message);
    }
  };

  useEffect(() => { cargarCompras(); calcularResumenTotal(); }, []);

  // Estilo Pasivo para Inputs
  const inputClass = (error) => `w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-700 bg-white shadow-sm ${error ? "border-red-300 focus:ring-red-100 focus:border-red-400 bg-red-50" : "border-slate-200 focus:ring-blue-100 focus:border-blue-400 hover:border-slate-300"}`;

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-4 lg:px-6 mx-auto max-w-7xl py-6 sm:py-8 space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">Compras de Materiales</h1>
            <p className="text-slate-500 text-sm mt-1">Gestión centralizada de adquisiciones e inventario.</p>
          </div>
          <button
            onClick={() => { if (editandoId) limpiarFormulario(); else setMostrarFormulario(!mostrarFormulario); }}
            className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold shadow-md transition-all transform active:scale-95 ${mostrarFormulario ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg'}`}
          >
            <span className="material-symbols-outlined">{editandoId ? "close" : "add"}</span>
            <span>{editandoId ? "Cancelar Edición" : "Nueva Compra"}</span>
          </button>
        </div>

        {/* FORMULARIO (Diseño Refinado) */}
        {mostrarFormulario && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xl shadow-slate-100 animate-fade-in-down relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">edit_note</span>
                  {editandoId ? "Editar Detalle de Compra" : "Registrar Nueva Adquisición"}
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Material <span className="text-red-400">*</span></label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej. Cemento Portland" className={inputClass(errors.nombre)} />{errors.nombre && <p className="text-xs text-red-500 mt-1 font-medium">{errors.nombre}</p>}</div>
                  <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Categoría <span className="text-red-400">*</span></label><input type="text" value={categoriaNombre} onChange={(e) => setCategoriaNombre(e.target.value)} placeholder="Ej. Obra Gris" className={inputClass(errors.categoriaNombre)} />{errors.categoriaNombre && <p className="text-xs text-red-500 mt-1 font-medium">{errors.categoriaNombre}</p>}</div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Cantidad <span className="text-red-400">*</span></label><input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="0" className={inputClass(errors.cantidad)} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Medida</label><input type="text" value={medida} onChange={(e) => setMedida(e.target.value)} placeholder="kg, m" className={inputClass(null)} /></div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Precio Unit. <span className="text-red-400">*</span></label><input type="number" step="0.01" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} placeholder="0.00" className={inputClass(errors.precioUnitario)} /></div>
                      <div><label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fecha <span className="text-red-400">*</span></label><input type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className={inputClass(errors.fechaCompra)} /></div>
                  </div>
                  
                  <div className="sm:col-span-2 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-slate-700">Datos del Proveedor</h4>
                          <button type="button" onClick={() => setMostrarDetallesProveedor(!mostrarDetallesProveedor)} className="text-xs text-blue-600 hover:text-blue-800 font-semibold bg-blue-50 px-3 py-1.5 rounded-full transition-colors">
                              {mostrarDetallesProveedor ? "Ocultar Detalles" : "+ Añadir Detalles"}
                          </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className={mostrarDetallesProveedor ? "" : "sm:col-span-2"}>
                              <input type="text" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} placeholder="Nombre del Proveedor (Opcional)" className={inputClass(null)} />
                          </div>
                          {mostrarDetallesProveedor && (
                              <>
                                  <div className="animate-fade-in"><input type="text" value={proveedorTelefono} onChange={(e) => setProveedorTelefono(e.target.value)} placeholder="Teléfono" className={inputClass(null)} /></div>
                                  <div className="sm:col-span-2 animate-fade-in"><input type="text" value={proveedorDireccion} onChange={(e) => setProveedorDireccion(e.target.value)} placeholder="Dirección completa" className={inputClass(null)} /></div>
                              </>
                          )}
                      </div>
                  </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100">
                  <button type="button" onClick={limpiarFormulario} className="px-6 py-2.5 rounded-lg border border-slate-300 text-slate-600 font-semibold hover:bg-slate-50 transition-colors">Cancelar</button>
                  <button type="submit" className="px-8 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-100 transition-all">{editandoId ? "Guardar Cambios" : "Registrar Compra"}</button>
              </div>
          </form>
        )}

        <ComprasSummaryCards 
          total={resumenDatos.total} 
          promedioPorCompra={resumenDatos.promedioPorCompra} 
          ultimaCompraMonto={resumenDatos.ultimaCompraMonto} 
          ultimaCompraFecha={resumenDatos.ultimaCompraFecha} 
        />
        
        {/* BARRA DE FILTROS */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-5 items-end">
          <div className="w-full md:w-56">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Mes de Compra</label>
              <div className="relative">
                  <select value={mesSeleccionado} onChange={handleMesChange} className="block w-full pl-4 pr-10 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm bg-slate-50 font-medium text-slate-700 appearance-none cursor-pointer">
                      <option value="">Todos los meses</option>
                      <option value="0">Enero</option>
                      <option value="1">Febrero</option>
                      <option value="2">Marzo</option>
                      <option value="3">Abril</option>
                      <option value="4">Mayo</option>
                      <option value="5">Junio</option>
                      <option value="6">Julio</option>
                      <option value="7">Agosto</option>
                      <option value="8">Septiembre</option>
                      <option value="9">Octubre</option>
                      <option value="10">Noviembre</option>
                      <option value="11">Diciembre</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-xl">calendar_month</span>
              </div>
          </div>
          <div className="w-full md:flex-1 grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Desde</label><input type="date" className="block w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none" value={fechaInicio} onChange={(e) => {setFechaInicio(e.target.value); setMesSeleccionado(""); }} /></div>
              <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Hasta</label><input type="date" className="block w-full py-2.5 px-3 border border-slate-200 rounded-xl text-sm text-slate-600 focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none" value={fechaFin} onChange={(e) => {setFechaFin(e.target.value); setMesSeleccionado("");}} /></div>
          </div>
          <button onClick={() => {setPaginaActual(1); cargarCompras(1);}} disabled={loading} className="w-full md:w-auto h-[42px] px-8 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-900 transition-colors shadow-lg shadow-slate-200 disabled:opacity-50">Filtrar</button>
        </div>

        {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-slate-800 mx-auto"></div></div> : <ComprasTable compras={compras} paginaActual={paginaActual} totalPaginas={totalPaginas} totalItems={totalItems} onChangePagina={(p) => { if(p>=1 && p<=totalPaginas) cargarCompras(p)}} onDelete={handleEliminar} onEdit={handleEditar} pageSize={pageSize} />}
      </div>
    </MainLayout>
  );
}