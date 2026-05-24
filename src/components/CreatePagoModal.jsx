import { useState } from "react";
import { createPago } from "../Api/pagoApi";

export default function CreatePagoModal({ onClose, onPagoCreated }) {
  const [formData, setFormData] = useState({
    empleadoId: "",
    monto: "",
    fecha: new Date().toISOString().slice(0, 10),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPago(formData);
      onPagoCreated();
    } catch (error) {
      console.error("Error creating pago:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600/60 dark:bg-black/70 overflow-y-auto h-full w-full flex items-start justify-center p-4 pt-16">
      <div className="relative w-full max-w-md shadow-lg rounded-xl bg-white dark:bg-neutral-900 border dark:border-neutral-700">
        <div className="p-5 sm:p-6">
        <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-neutral-100">Nuevo Pago</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Empleado ID
            </label>
            <input
              type="text"
              name="empleadoId"
              value={formData.empleadoId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Monto
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-1">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2.5 text-sm border border-gray-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-700 dark:hover:bg-neutral-600 text-gray-700 dark:text-neutral-200 font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  );
}
