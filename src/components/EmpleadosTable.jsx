import { showConfirm } from "../utils/alerts";

export default function EmpleadosTable({ empleados, onEdit, onDelete }) {
  
    const formatearMoneda = (valor) => {
      const num = Number(valor);
      return num.toLocaleString("es-SV", { style: "currency", currency: "USD" });
    };

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
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-neutral-300">
            <thead className="border-b border-slate-200 dark:border-neutral-700">
                <tr>
                <th className="px-6 py-3 font-semibold text-slate-500 dark:text-neutral-400">Nombre Completo</th>
                <th className="px-6 py-3 font-semibold text-right text-slate-500 dark:text-neutral-400">Pago por Día</th>
                <th className="px-6 py-3 font-semibold text-center text-slate-500 dark:text-neutral-400">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {empleados.length === 0 ? (
                <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-slate-400 dark:text-neutral-500">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-neutral-600 mb-2">group_off</span>
                    <p>No hay empleados registrados.</p>
                    </td>
                </tr>
                ) : (
                empleados.map((empleado) => (
                    <tr key={empleado.id} className="border-b border-slate-100 dark:border-neutral-800 last:border-0">
                    <td className="px-6 py-4">
                        <div className="font-medium text-slate-800 dark:text-neutral-100">{empleado.nombreCompleto}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                        <span className="text-green-700 dark:text-green-400 font-medium">
                            {formatearMoneda(empleado.pagoPorDia)} / día
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                        <button
                            onClick={() => onEdit(empleado)}
                            className="p-2 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button
                            onClick={() => handleDeleteClick(empleado.id)}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
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
