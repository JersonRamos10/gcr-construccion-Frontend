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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <h3 className="text-lg font-bold mb-4">Nuevo Pago</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Empleado ID
            </label>
            <input
              type="text"
              name="empleadoId"
              value={formData.empleadoId}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Monto
            </label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
