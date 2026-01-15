const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}/api/Empleado`;

export async function getEmpleados() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al cargar empleados");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createEmpleado(empleado) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al crear empleado");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateEmpleado(id, empleado) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empleado),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al actualizar empleado");
    }
    return true; // 204 No Content
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deleteEmpleado(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Error al eliminar empleado");
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}