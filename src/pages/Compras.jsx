import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import ComprasTable from "../components/ComprasTable";
import ComprasSummaryCards from "../components/ComprasSummaryCards";
import { getCompras, createCompra, deleteCompra, updateCompra, getAllCompras } from "../Api/compraApi";
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
  
  // Proveedor (Campos restaurados)
  const [proveedorNombre, setProveedorNombre] = useState("");
  const [proveedorTelefono, setProveedorTelefono] = useState("");
  const [proveedorDireccion, setProveedorDireccion] = useState("");
  const [mostrarDetallesProveedor, setMostrarDetallesProveedor] = useState(false);

  const [errors, setErrors] = useState({});

  // Datos
  const [compras, setCompras] = useState([]);
  const [resumenDatos, setResumenDatos] = useState({ total: "0.00", promedioPorCompra: "0.00", ultimaCompra: "0.00" });
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // FILTROS
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Selector de meses
  const [mesSeleccionado, setMesSeleccionado] = useState("");

  const formatearMoneda = (valor) => {
    if (valor === null || valor === undefined) return "0.00";
    return Number(valor).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calcularResumenTotal = async () => {
    try {
      const allCompras = await getAllCompras();
      if (allCompras.length === 0) {
        setResumenDatos({ total: "0.00", promedioPorCompra: "0.00", ultimaCompra: "0.00" });
        return;
      }
      const total = allCompras.reduce((sum, compra) => sum + (compra.montoTotal || 0), 0);
      setResumenDatos({
        total: formatearMoneda(total),
        promedioPorCompra: formatearMoneda(total / allCompras.length),
        ultimaCompra: formatearMoneda(allCompras[0]?.montoTotal || 0),
      });
    } catch (error) {
      console.error(error);
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

  // Lógica del Filtro de Meses
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
        const fechaInicioStr = primerDia.toISOString().split('T')[0];
        const ultimoDia = new Date(yearActual, mesIndex + 1, 0);
        const fechaFinStr = ultimoDia.toISOString().split('T')[0];

        setFechaInicio(fechaInicioStr);
        setFechaFin(fechaFinStr);
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
    
    // Si tiene teléfono o dirección, mostramos los detalles automáticamente
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

  const inputClass = (error) => `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${error ? "border-red-500 focus:ring-red-200 bg-red-50" : "border-gray-200 focus:ring-blue-500 focus:border-blue-500"}`;

  return (
    <MainLayout>
      <div className="w-full px-3 sm:px-4 lg:px-6 mx-auto max-w-7xl py-4 sm:py-6 lg:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">Compras de Materiales</h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xl mt-1">Registra y gestiona las compras de materiales.</p>
            </div>
            <button
              onClick={() => { if (editandoId) limpiarFormulario(); else setMostrarFormulario(!mostrarFormulario); }}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg h-11 text-sm sm:text-base transition-colors"
            >
              <span className="material-symbols-outlined">{editandoId ? "close" : "add"}</span>
              <span>{editandoId ? "Cancelar" : "Nueva Compra"}</span>
            </button>
          </div>

          {/* FORMULARIO */}
          {mostrarFormulario && (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-4 sm:p-6 space-y-4 shadow-sm animate-fade-in-down">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Campos Básicos */}
                    <div><label className="block text-sm font-medium text-gray-900 mb-2">Nombre del Material <span className="text-red-500">*</span></label><input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej.Cemento" className={inputClass(errors.nombre)} />{errors.nombre && <p className="text-xs text-red-600 mt-1">{errors.nombre}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-900 mb-2">Categoría <span className="text-red-500">*</span></label><input type="text" value={categoriaNombre} onChange={(e) => setCategoriaNombre(e.target.value)} placeholder="Ej.Construccion, Fontaneria, Extras" className={inputClass(errors.categoriaNombre)} />{errors.categoriaNombre && <p className="text-xs text-red-600 mt-1">{errors.categoriaNombre}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-900 mb-2">Cantidad <span className="text-red-500">*</span></label><input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} placeholder="Ej.10" className={inputClass(errors.cantidad)} />{errors.cantidad && <p className="text-xs text-red-600 mt-1">{errors.cantidad}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-900 mb-2">Precio Unitario <span className="text-red-500">*</span></label><input type="number" step="0.01" value={precioUnitario} onChange={(e) => setPrecioUnitario(e.target.value)} placeholder="Ej.10.00" className={inputClass(errors.precioUnitario)} />{errors.precioUnitario && <p className="text-xs text-red-600 mt-1">{errors.precioUnitario}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-900 mb-2">Fecha de Compra <span className="text-red-500">*</span></label><input type="date" value={fechaCompra} onChange={(e) => setFechaCompra(e.target.value)} className={inputClass(errors.fechaCompra)} />{errors.fechaCompra && <p className="text-xs text-red-600 mt-1">{errors.fechaCompra}</p>}</div>
                    <div><label className="block text-sm font-medium text-gray-900 mb-2">Medida (Opcional)</label><input type="text" value={medida} onChange={(e) => setMedida(e.target.value)} placeholder="Ej: kg, m, bolsas" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    
                    {/* Sección Proveedor Restaurada */}
                    <div className="sm:col-span-2 border-t pt-4 mt-2">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Información del Proveedor</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-900 mb-2">Nombre del Proveedor</label>
                                <input type="text" value={proveedorNombre} onChange={(e) => setProveedorNombre(e.target.value)} placeholder="Ej: Ferretería Central" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div className="sm:col-span-2">
                                <button type="button" onClick={() => setMostrarDetallesProveedor(!mostrarDetallesProveedor)} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                                    <span className="material-symbols-outlined text-base">{mostrarDetallesProveedor ? "expand_less" : "expand_more"}</span>
                                    {mostrarDetallesProveedor ? "Ocultar detalles contacto" : "Añadir contacto del proveedor"}
                                </button>
                            </div>

                            {mostrarDetallesProveedor && (
                                <>
                                    <div className="animate-fade-in-down"><label className="block text-sm font-medium text-gray-900 mb-2">Teléfono</label><input type="text" value={proveedorTelefono} onChange={(e) => setProveedorTelefono(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                                    <div className="animate-fade-in-down"><label className="block text-sm font-medium text-gray-900 mb-2">Dirección</label><input type="text" value={proveedorDireccion} onChange={(e) => setProveedorDireccion(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500" /></div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <button type="button" onClick={limpiarFormulario} className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors">Cancelar</button>
                    <button type="submit" className="w-full sm:w-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">{editandoId ? "Actualizar" : "Guardar"}</button>
                </div>
            </form>
          )}

          <ComprasSummaryCards total={resumenDatos.total} promedioPorCompra={resumenDatos.promedioPorCompra} ultimaCompra={resumenDatos.ultimaCompra} />
          
          {/* BARRA DE FILTROS */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-end">
            
            {/* 1. FILTRO RÁPIDO POR MESES */}
            <div className="w-full md:w-48">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1 block">Filtrar por Mes</label>
                <select 
                    value={mesSeleccionado} 
                    onChange={handleMesChange}
                    className="block w-full h-10 px-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-gray-50 font-medium text-gray-700"
                >
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
            </div>

            {/* 2. FECHAS MANUALES */}
            <div className="w-full md:flex-1 grid grid-cols-2 gap-3">
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Desde</label>
                    <input type="date" className="block w-full h-10 px-3 border border-gray-200 rounded-lg mt-1 text-sm text-gray-600" value={fechaInicio} onChange={(e) => {setFechaInicio(e.target.value); setMesSeleccionado(""); }} />
                </div>
                <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hasta</label>
                    <input type="date" className="block w-full h-10 px-3 border border-gray-200 rounded-lg mt-1 text-sm text-gray-600" value={fechaFin} onChange={(e) => {setFechaFin(e.target.value); setMesSeleccionado("");}} />
                </div>
            </div>

            {/* 3. BOTÓN APLICAR */}
            <button onClick={() => {setPaginaActual(1); cargarCompras(1);}} disabled={loading} className="w-full md:w-auto h-10 px-6 rounded-lg bg-gray-900 text-white font-medium hover:bg-black transition-colors disabled:opacity-50 shadow-sm">
                Aplicar Filtros
            </button>
          </div>

          {loading ? <div className="text-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div> : <ComprasTable compras={compras} paginaActual={paginaActual} totalPaginas={totalPaginas} totalItems={totalItems} onChangePagina={(p) => { if(p>=1 && p<=totalPaginas) cargarCompras(p)}} onDelete={handleEliminar} onEdit={handleEditar} pageSize={pageSize} />}
        </div>
      </div>
    </MainLayout>
  );
}