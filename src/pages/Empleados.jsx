import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import EmpleadosTable from "../components/EmpleadosTable";
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from "../Api/empleadoApi";
import { showAlert } from "../utils/alerts"; // IMPORTAR ALERTAS

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados de formulario
  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [pagoPorDia, setPagoPorDia] = useState("");
  
  // Estados de validación
  const [errors, setErrors] = useState({});

  // Cargar datos
  const cargarEmpleados = async () => {
    setLoading(true);
    try {
      const data = await getEmpleados();
      setEmpleados(data); 
    } catch (error) {
      console.error(error);
      setEmpleados([]); // Asegurar array vacío en error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // --- VALIDACIÓN ---
  const validateForm = () => {
    const newErrors = {};
    if (!nombreCompleto.trim()) newErrors.nombreCompleto = "El nombre es obligatorio.";
    if (!pagoPorDia || Number(pagoPorDia) <= 0) newErrors.pagoPorDia = "El pago debe ser mayor a 0.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        showAlert("error", "Por favor corrige los errores.");
        return;
    }

    const empleadoData = {
      nombreCompleto,
      pagoPorDia: parseFloat(pagoPorDia),
    };

    try {
      if (editandoId) {
        await updateEmpleado(editandoId, empleadoData);
        showAlert("success", "Empleado actualizado correctamente");
      } else {
        await createEmpleado(empleadoData);
        showAlert("success", "Empleado registrado exitosamente");
      }
      resetForm();
      cargarEmpleados();
    } catch (err) {
      const msg = err.message || "Ocurrió un error al guardar";
      showAlert("error", msg);
    }
  };

  // Editar (Con Scroll Suave)
  const handleEdit = (empleado) => {
    setEditandoId(empleado.id);
    setNombreCompleto(empleado.nombreCompleto);
    setPagoPorDia(empleado.pagoPorDia.toString()); // Convertir a string para el input
    setErrors({});
    setMostrarForm(true);

    // UX: Scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Eliminar (La confirmación la hace la tabla, aquí solo ejecutamos)
  const handleDelete = async (id) => {
    try {
      await deleteEmpleado(id);
      await cargarEmpleados();
      showAlert("success", "Empleado eliminado");
    } catch (error) {
      showAlert("error", "No se pudo eliminar el empleado");
    }
  };

  // Limpiar
  const resetForm = () => {
    setNombreCompleto("");
    setPagoPorDia("");
    setEditandoId(null);
    setMostrarForm(false);
    setErrors({});
  };

  // Helper de estilos para inputs
  const inputClass = (error) => `
    w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all
    ${error 
      ? "border-red-500 focus:ring-red-200 bg-red-50" 
      : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"}
  `;

  return (
    <MainLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Empleados</h1>
            <p className="text-gray-500 text-sm mt-1">Gestión de personal y costos de mano de obra.</p>
          </div>
          <button
            onClick={() => {
                if(mostrarForm) resetForm();
                else setMostrarForm(true);
            }}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-colors ${
                mostrarForm 
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200" 
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <span className="material-symbols-outlined">
                {mostrarForm ? "close" : "person_add"}
            </span>
            {mostrarForm ? "Cancelar" : "Nuevo Empleado"}
          </button>
        </div>

        {/* Formulario Desplegable */}
        {mostrarForm && (
          <div className="mb-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-fade-in-down">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {editandoId ? "Editar Empleado" : "Registrar Nuevo Empleado"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className={inputClass(errors.nombreCompleto)}
                  />
                  {errors.nombreCompleto && <p className="text-xs text-red-600 mt-1">{errors.nombreCompleto}</p>}
                </div>

                {/* Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pago por Día ($) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={pagoPorDia}
                    onChange={(e) => setPagoPorDia(e.target.value)}
                    placeholder="0.00"
                    className={inputClass(errors.pagoPorDia)}
                  />
                  {errors.pagoPorDia && <p className="text-xs text-red-600 mt-1">{errors.pagoPorDia}</p>}
                </div>
              </div>

              <div className="flex justify-end pt-2 gap-3">
                 <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                >
                  {editandoId ? "Actualizar" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tabla */}
        {loading ? (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <EmpleadosTable 
                empleados={empleados} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
            />
        )}
      </div>
    </MainLayout>
  );
}