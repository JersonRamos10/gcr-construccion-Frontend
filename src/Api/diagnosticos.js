// Funciones de Utilidad para APIs de Ingresos y Compras

const API_BASE = import.meta.env.VITE_API_URL;

/**
 * Obtener lista de ingresos con paginación y filtros
 * @param {number} page - Número de página
 * @param {number} pageSize - Cantidad de registros por página
 * @param {string} fromDate - Fecha inicio (formato YYYY-MM-DD)
 * @param {string} toDate - Fecha fin (formato YYYY-MM-DD)
 * @returns {Promise<Object>} - { items, page, pageSize, totalItems, totalPages }
 */
export async function fetchIngresos(page = 1, pageSize = 5, fromDate = "", toDate = "") {
  try {
    let url = `${API_BASE}/api/Ingreso?page=${page}&pageSize=${pageSize}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error al cargar ingresos:", error);
    throw error;
  }
}

/**
 * Obtener lista de compras con paginación y filtros
 * @param {number} page - Número de página
 * @param {number} pageSize - Cantidad de registros por página
 * @param {string} fromDate - Fecha inicio (formato YYYY-MM-DD)
 * @param {string} toDate - Fecha fin (formato YYYY-MM-DD)
 * @returns {Promise<Object>} - { items, page, pageSize, totalItems, totalPages }
 */
export async function fetchCompras(page = 1, pageSize = 5, fromDate = "", toDate = "") {
  try {
    let url = `${API_BASE}/api/CompraMaterial?page=${page}&pageSize=${pageSize}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error al cargar compras:", error);
    throw error;
  }
}

/**
 * Crear un nuevo ingreso
 * @param {Object} ingresoData - { descripcion, monto, fecha }
 * @returns {Promise<Object>} - Ingreso creado
 */
export async function createIngreso(ingresoData) {
  try {
    const response = await fetch(`${API_BASE}/api/Ingreso`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ingresoData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error al crear ingreso:", error);
    throw error;
  }
}

/**
 * Crear una nueva compra
 * @param {Object} compraData - { nombre, cantidad, precioUnitario, fechaCompra, categoriaNombre, proveedorNombre }
 * @returns {Promise<Object>} - Compra creada
 */
export async function createCompra(compraData) {
  try {
    const response = await fetch(`${API_BASE}/api/CompraMaterial`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compraData),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    return await response.json();
  } catch (error) {
    console.error("❌ Error al crear compra:", error);
    throw error;
  }
}

/**
 * Eliminar un ingreso
 * @param {number} id - ID del ingreso
 * @returns {Promise<boolean>} - true si se eliminó
 */
export async function deleteIngreso(id) {
  try {
    const response = await fetch(`${API_BASE}/api/Ingreso/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar ingreso:", error);
    throw error;
  }
}

/**
 * Eliminar una compra
 * @param {number} id - ID de la compra
 * @returns {Promise<boolean>} - true si se eliminó
 */
export async function deleteCompra(id) {
  try {
    const response = await fetch(`${API_BASE}/api/CompraMaterial/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Error ${response.status}: ${error}`);
    }
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar compra:", error);
    throw error;
  }
}
