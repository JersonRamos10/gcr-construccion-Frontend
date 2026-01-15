const API_URL = import.meta.env.VITE_API_URL;

export async function getDashboardResumen(fechaInicio, fechaFin) {
  let url = `${API_URL}/api/dashboard/resumen`;

  if (fechaInicio && fechaFin) {
    url += `?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Error al obtener el resumen del dashboard");
  }

  return await response.json();
}
