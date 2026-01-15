import { showConfirm } from "../utils/alerts"; // IMPORTAR

export default function EmpleadosTable({ empleados, onEdit, onDelete }) {
  
    // Formatear moneda
    const formatearMoneda = (valor) => {
      const num = Number(valor);
      return num.toLocaleString("es-SV", { style: "currency", currency: "USD" });
    };

    // Manejar eliminación con confirmación
    const handleDeleteClick = async (id) => {
        const confirmado = await showConfirm(
            "¿Eliminar empleado?",
            "Esta acción no se puede deshacer y afectará el historial de pagos."
        );
        if (confirmado) {
            onDelete(id);
        }
    };
  
    return (
      <div className="bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase border-b border-gray-200">
                <tr>
                <th className="px-6 py-4 font-semibold tracking-wide">Nombre Completo</th>
                <th className="px-6 py-4 font-semibold text-right tracking-wide">Pago por Día</th>
                <th className="px-6 py-4 font-semibold text-center tracking-wide">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {empleados.length === 0 ? (
                <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500">
                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">group_off</span>
                    <p>No hay empleados registrados.</p>
                    </td>
                </tr>
                ) : (
                empleados.map((empleado) => (
                    <tr key={empleado.id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors last:border-0">
                    <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 text-base">{empleado.nombreCompleto}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-green-200">
                            {formatearMoneda(empleado.pagoPorDia)} / día
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onEdit(empleado)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                            onClick={() => handleDeleteClick(empleado.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Eliminar"
                        >
                            <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                        </div>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    );
}