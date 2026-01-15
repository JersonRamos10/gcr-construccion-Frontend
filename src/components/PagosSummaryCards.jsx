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
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700">Total Pagado</h2>
        <p className="text-2xl font-bold text-gray-900">
          ${totalPagos.toLocaleString()}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700">Pago Promedio</h2>
        <p className="text-2xl font-bold text-gray-900">
          ${promedioPago.toLocaleString()}
        </p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700">
          Pagos (Este Mes)
        </h2>
        <p className="text-2xl font-bold text-gray-900">{pagosEsteMes}</p>
      </div>
    </div>
  );
}
