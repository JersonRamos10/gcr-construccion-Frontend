const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}/api/Persona`;

export async function getPersonas() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Error al cargar personas");
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function createPersona(personaData) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(personaData),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Error al crear persona");
    }
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function deletePersona(id) {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Error al eliminar persona");
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
