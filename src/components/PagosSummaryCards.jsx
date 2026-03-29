import { useMemo } from "react";

export default function PagosSummaryCards({ pagos }) {
  const { totalPagos, promedioPago, pagosEsteMes } = useMemo(() => {
    if (!pagos || pagos.length === 0) {
      return { totalPagos: 0, promedioPago: 0, pagosEsteMes: 0 };
    }

    const totalPagos = pagos.reduce((sum, pago) => sum + pago.monto, 0);
    const promedioPago = totalPagos / pagos.length;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const pagosEsteMes = pagos.filter((pago) => {
      const pagoDate = new Date(pago.fecha);
      return (
        pagoDate.getMonth() === currentMonth &&
        pagoDate.getFullYear() === currentYear
      );
    }).length;

    return { totalPagos, promedioPago, pagosEsteMes };
  }, [pagos]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-green-500">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Total Pagado</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 truncate">
          ${totalPagos.toLocaleString()}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-blue-500">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Pago Promedio</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 truncate">
          ${promedioPago.toLocaleString()}
        </p>
      </div>
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 border-l-4 border-l-purple-500">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Pagos (Este Mes)</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100">{pagosEsteMes}</p>
      </div>
    </div>
  );
}
