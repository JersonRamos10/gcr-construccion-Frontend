const API_BASE = import.meta.env.VITE_API_URL;
const API_URL = `${API_BASE}/api/Proyecto`;

export async function getProyectos() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error("Error fetching proyectos");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching a project:", error);
    throw error;
  }
}
