const API_BASE = import.meta.env.VITE_API_URL;
// CORRECCIÓN 1: Ajustamos la URL para coincidir con el nombre del Controller
const API_URL = `${API_BASE}/api/CompraMaterial`; 

export async function getCompras(page = 1, pageSize = 5, fromDate = "", toDate = "") {
  try {
    let url = `${API_URL}?page=${page}&pageSize=${pageSize}`;
    if (fromDate) url += `&fromDate=${fromDate}`;
    if (toDate) url += `&toDate=${toDate}`;

    console.log("📥 Cargando compras desde:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error cargando compras:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Compras cargadas:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al cargar compras:", error);
    throw error;
  }
}

export async function createCompra(compraData) {
  try {
    console.log("📤 Creando compra:", compraData);
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compraData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error creando compra:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Compra creada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al crear compra:", error);
    throw error;
  }
}

export async function deleteCompra(id) {
  try {
    console.log("🗑️ Eliminando compra:", id);
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error eliminando compra:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    console.log("✅ Compra eliminada");
    return true;
  } catch (error) {
    console.error("❌ Error al eliminar compra:", error);
    throw error;
  }
}

export async function updateCompra(id, compraData) {
  try {
    console.log("📝 Actualizando compra:", id, compraData);
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(compraData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error actualizando compra:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    // Nota: El backend retorna NoContent (204) o NotFound, no siempre retorna JSON en el update
    // Si es 204, no intentamos hacer .json()
    if (response.status === 204) {
        console.log("✅ Compra actualizada (No Content)");
        return true;
    }

    const data = await response.json();
    console.log("✅ Compra actualizada:", data);
    return data;
  } catch (error) {
    console.error("❌ Error al actualizar compra:", error);
    throw error;
  }
}

// CORRECCIÓN 2: Adaptamos getAllCompras porque no existe el endpoint /all en el backend
export async function getAllCompras() {
  try {
    // Truco: Pedimos la página 1 con un tamaño muy grande para simular "Traer todo"
    // ya que el backend no tiene un endpoint específico para '/all'
    let url = `${API_URL}?page=1&pageSize=1000`; 
    
    console.log("📥 Cargando resumen (simulando all) desde:", url);
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Error cargando todas las compras:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log("✅ Datos para resumen cargados:", data);
    
    // IMPORTANTE: El backend devuelve un objeto paginado { items: [], totalItems: ... }
    // Pero tu componente espera un array directo para hacer .reduce().
    // Devolvemos solo la lista 'items'.
    return data.items || []; 

  } catch (error) {
    console.error("❌ Error al cargar todas las compras:", error);
    throw error;
  }
}