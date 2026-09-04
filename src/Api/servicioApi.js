const API_URL = `${import.meta.env.VITE_API_URL}/api/servicios`;

async function request(path = "", options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || (data?.errors && Object.values(data.errors).flat().join(" ")) || "No se pudo completar la operación.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const getServicios = (filters, signal) => request(`?${new URLSearchParams(filters)}`, { signal });
export const getServicio = (id, signal) => request(`/${id}`, { signal });
export const createServicio = (data) => request("", { method: "POST", body: JSON.stringify(data) });
export const updateServicio = (id, data) => request(`/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const createAbono = (id, data) => request(`/${id}/abonos`, { method: "POST", body: JSON.stringify(data) });
export const anularAbono = (id, abonoId, motivo) => request(`/${id}/abonos/${abonoId}/anular`, { method: "POST", body: JSON.stringify({ motivo }) });
