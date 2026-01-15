// API para Ingresos

const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}/api/Ingreso`;

/**
 * Obtener lista de ingresos con paginación y filtros
 */
export async function getIngresos(page = 1, pageSize = 5, fromDate = "", toDate = "") {
  try {
    let url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    console.log("📥 Cargando ingresos desde:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error:", errorText);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Ingresos cargados:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al cargar ingresos:", error);
    throw error;
  }
}

/**
 * Crear un nuevo ingreso
 */
export async function createIngreso(ingresoData) {
  try {
    console.log("📤 Creando ingreso:", ingresoData);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingresoData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error:", errorText);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Ingreso creado:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al crear ingreso:", error);
    throw error;
  }
}

/**
 * Eliminar un ingreso
 */
export async function deleteIngreso(id) {
  try {
    console.log("🗑️ Eliminando ingreso:", id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error:", errorText);
      throw new Error(`HTTP Error: ${response.status}`);
    }

    console.log("✅ Ingreso eliminado");
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar ingreso:", error);
    throw error;
  }
}
