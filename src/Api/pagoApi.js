const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}/api/PagoManoDeObra`;

export async function getPagos(page = 1, pageSize = 5, empleadoId = null, fromDate = "", toDate = "") {
  try {
    let url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
    
    // Filtros opcionales
    if (empleadoId) url += `&empleadoId=${empleadoId}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error al cargar pagos");
    
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createPago(pagoData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pagoData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al registrar el pago");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePago(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar el pago");
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}