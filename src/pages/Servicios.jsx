import { useEffect, useRef, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import Pagination from "../components/Pagination";
import { getServicios, getServicio, createServicio, updateServicio, createAbono, anularAbono } from "../Api/servicioApi";

const estados = ["Contratado", "Pendiente de inicio", "Comenzado", "Finalizado"];
const money = (value) => new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(value);
const today = () => new Date().toLocaleDateString("en-CA");
const date = (value) => value?.slice(0, 10);
const timestamp = (value) => new Date(value.endsWith("Z") ? value : `${value}Z`).toLocaleString("es-SV");
const inputClass = "w-full mt-1 rounded-lg border border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 px-3 py-2.5 text-gray-900 dark:text-neutral-100";
const panelClass = "bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl p-5 sm:p-6";
const buttonClass = "rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed";
const secondaryClass = "rounded-lg border border-gray-300 dark:border-neutral-600 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-neutral-800 disabled:opacity-50";

function Field({ label, children }) {
  return <label className="block text-sm font-medium">{label}{children}</label>;
}

function ServicioForm({ servicio, onSave, onCancel }) {
  const [form, setForm] = useState(() => servicio ? { ...servicio, fechaContratacion: date(servicio.fechaContratacion), motivo: "" }
    : { nombre: "", telefono: "", tipoServicio: "", fechaContratacion: today(), montoAcordado: "", observacion: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });
  const needsReason = servicio && (Number(form.montoAcordado) !== servicio.montoAcordado || estados.indexOf(form.estado) < estados.indexOf(servicio.estado));
  async function submit(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const payload = { ...form, montoAcordado: Number(form.montoAcordado) };
      const result = servicio ? await updateServicio(servicio.id, payload) : await createServicio(payload);
      onSave(result);
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(false); }
  }
  return <form onSubmit={submit} className={panelClass}>
    <h2 className="text-lg font-semibold mb-4">{servicio ? "Editar servicio" : "Registrar servicio"}</h2>
    <fieldset disabled={busy} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Persona o empresa"><input className={inputClass} value={form.nombre} onChange={set("nombre")} maxLength={150} required /></Field>
      <Field label="Teléfono de contacto"><input type="tel" className={inputClass} value={form.telefono} onChange={set("telefono")} maxLength={40} required /></Field>
      <Field label="Tipo de servicio"><input className={inputClass} value={form.tipoServicio} onChange={set("tipoServicio")} maxLength={100} placeholder="Ej. Instalación eléctrica" required /></Field>
      <Field label="Fecha de contratación"><input type="date" className={inputClass} value={form.fechaContratacion} onChange={set("fechaContratacion")} max={today()} required /></Field>
      <Field label="Monto acordado ($)"><input type="number" className={inputClass} value={form.montoAcordado} onChange={set("montoAcordado")} min={servicio?.totalAbonado || "0.01"} max="999999999.99" step="0.01" required /></Field>
      {servicio && <Field label="Estado del trabajo"><select className={inputClass} value={form.estado} onChange={set("estado")}>{estados.map(s => <option key={s}>{s}</option>)}</select></Field>}
      <div className="sm:col-span-2"><Field label="Observación (opcional)"><textarea className={inputClass} value={form.observacion || ""} onChange={set("observacion")} maxLength={1000} rows={2} /></Field></div>
      {servicio && <div className="sm:col-span-2"><Field label={`Motivo del cambio${needsReason ? " (obligatorio)" : " (opcional)"}`}><input className={inputClass} value={form.motivo} onChange={set("motivo")} maxLength={500} required={needsReason} /></Field></div>}
    </fieldset>
    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-4">El monto acordado no descuenta capital. Solo lo hacen los abonos registrados.</p>
    {error && <p role="alert" className="text-red-600 dark:text-red-400 mt-3">{error}</p>}
    <div className="flex justify-end gap-3 mt-4"><button type="button" className={secondaryClass} disabled={busy} onClick={onCancel}>Cancelar</button><button className={buttonClass} disabled={busy}>{busy ? "Guardando..." : "Guardar servicio"}</button></div>
  </form>;
}

function readPending(id) {
  try { return JSON.parse(sessionStorage.getItem(`abono-servicio-${id}`)); } catch { return null; }
}

function AbonoModal({ open, servicio, pending, abono, setAbono, busy, error, onSubmit, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !busy) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, busy, onClose]);

  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl dark:bg-neutral-900 sm:rounded-2xl sm:p-6" role="dialog" aria-modal="true" aria-labelledby="abono-modal-title" onMouseDown={event => event.stopPropagation()}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 id="abono-modal-title" className="text-lg font-semibold">Registrar abono</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">{servicio.tipoServicio} · {servicio.nombre}</p>
        </div>
        <button type="button" aria-label="Cerrar" className="rounded-lg p-2 text-xl leading-none text-gray-500 hover:bg-gray-100 dark:text-neutral-400 dark:hover:bg-neutral-800" disabled={busy} onClick={onClose}>×</button>
      </div>
      {pending && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">Hay una confirmación pendiente. Reintenta para recuperar el resultado sin duplicar el pago.</p>}
      <form onSubmit={onSubmit} className="mt-5 space-y-5">
        <fieldset disabled={busy || !!pending} className="grid gap-4 sm:grid-cols-3">
          <Field label="Monto del abono ($)"><input type="number" className={inputClass} min="0.01" max={servicio.saldoPendiente} step="0.01" value={abono.monto} onChange={e => setAbono({ ...abono, monto: e.target.value })} required /></Field>
          <Field label="Fecha del pago"><input type="date" className={inputClass} min={date(servicio.fechaContratacion)} max={today()} value={abono.fechaPago} onChange={e => setAbono({ ...abono, fechaPago: e.target.value })} required /></Field>
          <Field label="Referencia o nota (opcional)"><input className={inputClass} maxLength={500} value={abono.referencia} onChange={e => setAbono({ ...abono, referencia: e.target.value })} /></Field>
        </fieldset>
        {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <p className="text-sm text-gray-500 dark:text-neutral-400">Al confirmar se descontará {money(Number(abono.monto) || 0)} del capital disponible.</p>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" className={secondaryClass} disabled={busy} onClick={onClose}>Cancelar</button>
          <button className={buttonClass} disabled={busy}>{busy ? "Confirmando..." : pending ? "Reintentar confirmación" : "Confirmar abono"}</button>
        </div>
      </form>
    </div>
  </div>;
}

function ServicioDetalle({ servicio, onChange, onBack }) {
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(() => readPending(servicio.id));
  const [abono, setAbono] = useState(() => readPending(servicio.id) || { monto: "", fechaPago: today(), referencia: "" });
  const [anulando, setAnulando] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [abonoModalOpen, setAbonoModalOpen] = useState(false);
  const lock = useRef(false);

  async function pay(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try {
      const payload = pending || { ...abono, monto: Number(abono.monto), solicitudId: crypto.randomUUID() };
      // Persist the same request before sending: reloads and lost responses cannot duplicate it.
      sessionStorage.setItem(`abono-servicio-${servicio.id}`, JSON.stringify(payload));
      setPending(payload);
      const result = await createAbono(servicio.id, payload);
      sessionStorage.removeItem(`abono-servicio-${servicio.id}`);
      setPending(null); setAbono({ monto: "", fechaPago: today(), referencia: "" });
      onChange(result); setAbonoModalOpen(false); setNotice("Abono confirmado. El capital y el saldo ya están actualizados.");
    } catch (err) {
      if (err.status === 400 || err.status === 404) {
        sessionStorage.removeItem(`abono-servicio-${servicio.id}`); setPending(null);
      }
      setError(`${err.message} ${!err.status || err.status >= 500 ? "Reintenta la confirmación; se conservará la misma solicitud para evitar duplicados." : ""}`);
    } finally { lock.current = false; setBusy(false); }
  }
  async function annul(e) {
    e.preventDefault();
    if (lock.current) return;
    lock.current = true; setBusy(true); setError(""); setNotice("");
    try {
      onChange(await anularAbono(servicio.id, anulando.id, motivo));
      setAnulando(null); setMotivo(""); setNotice("Abono anulado. Se revirtió su descuento del capital.");
    } catch (err) { setError(err.message); }
    finally { lock.current = false; setBusy(false); }
  }
  if (editing) return <ServicioForm servicio={servicio} onCancel={() => setEditing(false)} onSave={s => { onChange(s); setEditing(false); }} />;
  return <div className="space-y-5">
    <div className="flex flex-wrap justify-between gap-3"><button className={secondaryClass} disabled={busy} onClick={onBack}>← Todos los servicios</button><button className={secondaryClass} disabled={busy || !!pending} onClick={() => setEditing(true)}>Editar servicio / estado</button></div>
    <section className={panelClass}>
      <div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">{servicio.tipoServicio}</h2><p className="mt-1">{servicio.nombre}</p><p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Tel. {servicio.telefono} · Contratado el {date(servicio.fechaContratacion)}</p></div><div className="flex gap-2 items-start"><span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200 px-3 py-1 text-sm">{servicio.estado}</span><span className="rounded-full bg-gray-100 dark:bg-neutral-800 px-3 py-1 text-sm">{servicio.estadoPago}</span></div></div>
      {servicio.observacion && <p className="mt-4 text-sm whitespace-pre-wrap break-words">{servicio.observacion}</p>}
      <div className="grid sm:grid-cols-3 gap-4 mt-5">{[["Monto acordado", servicio.montoAcordado], ["Total abonado", servicio.totalAbonado], ["Saldo pendiente", servicio.saldoPendiente]].map(([label, value]) => <div key={label} className="rounded-lg bg-gray-50 dark:bg-neutral-800 p-4"><p className="text-sm text-gray-500 dark:text-neutral-400">{label}</p><p className="text-2xl font-semibold mt-1">{money(value)}</p></div>)}</div>
      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-3">Los saldos incluyen todo el historial. Finalizar el trabajo no cambia su estado de pago.</p>
    </section>
    {notice && <p role="status" className="rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 p-4">{notice}</p>}
    {error && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-200 p-4">{error}</p>}
    {(servicio.saldoPendiente > 0 || pending) && <>
      <section className={panelClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h3 className="font-semibold">Registrar abono</h3><p className="mt-1 text-sm text-gray-500 dark:text-neutral-400">Registra un pago parcial y actualiza el saldo del servicio.</p></div>
          <button type="button" className={buttonClass} disabled={busy} onClick={() => { setError(""); setAbonoModalOpen(true); }}>{pending ? "Reintentar abono" : "Registrar abono"}</button>
        </div>
      </section>
      <AbonoModal open={abonoModalOpen} servicio={servicio} pending={pending} abono={abono} setAbono={setAbono} busy={busy} error={error} onSubmit={pay} onClose={() => setAbonoModalOpen(false)} />
    </>}
    <section className={panelClass}>
      <h3 className="font-semibold mb-4">Historial de abonos</h3>
      {servicio.abonos.length === 0 ? <p className="text-gray-500 dark:text-neutral-400">Este servicio todavía no tiene abonos.</p> : <div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-gray-500 dark:text-neutral-400"><tr>{["Fecha / registro", "Monto", "Referencia", "Estado", "Acción"].map(h => <th key={h} className="p-3">{h}</th>)}</tr></thead><tbody>{servicio.abonos.map(a => <tr key={a.id} className="border-t border-gray-200 dark:border-neutral-700"><td className="p-3 whitespace-nowrap">{date(a.fechaPago)}<span className="block text-xs text-gray-500 dark:text-neutral-400">#{a.id} · {timestamp(a.fechaRegistro)}</span></td><td className={`p-3 whitespace-nowrap ${a.anulado ? "line-through text-gray-400" : "font-semibold"}`}>{money(a.monto)}</td><td className="p-3 break-words max-w-xs">{a.referencia || "—"}</td><td className="p-3">{a.anulado ? <><span className="text-red-600 dark:text-red-400">Anulado</span><p className="text-xs mt-1 break-words">{a.motivoAnulacion}</p><p className="text-xs">{timestamp(a.fechaAnulacion)}</p></> : "Vigente"}</td><td className="p-3">{!a.anulado && <button className="text-red-600 dark:text-red-400 underline disabled:opacity-50" disabled={busy || !!pending} onClick={() => { setAnulando(a); setMotivo(""); }}>Anular</button>}</td></tr>)}</tbody></table></div>}
      {anulando && <form onSubmit={annul} className="mt-4 border border-red-200 dark:border-red-900 rounded-lg p-4 space-y-3"><p>Anular abono #{anulando.id} de <strong>{money(anulando.monto)}</strong>. Se conservará el registro y se revertirá su descuento.</p><Field label="Motivo de anulación"><input className={inputClass} value={motivo} onChange={e => setMotivo(e.target.value)} maxLength={500} required disabled={busy} /></Field><div className="flex justify-end gap-3"><button type="button" className={secondaryClass} disabled={busy} onClick={() => setAnulando(null)}>Cancelar</button><button className={buttonClass} disabled={busy}>Confirmar anulación</button></div></form>}
    </section>
    <section className={panelClass}><h3 className="font-semibold mb-4">Actividad del servicio</h3><ol className="space-y-4">{servicio.historial.map(h => <li key={h.id} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4"><p className="text-sm font-medium">{h.tipo} <span className="font-normal text-gray-500 dark:text-neutral-400">· {timestamp(h.fechaRegistro)}</span></p><p className="text-sm mt-1 break-words">{h.detalle}</p>{h.motivo && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 break-words">Motivo: {h.motivo}</p>}</li>)}</ol></section>
  </div>;
}

export default function Servicios() {
  const [filters, setFilters] = useState({ search: "", estado: "", conSaldo: false });
  const [query, setQuery] = useState({ search: "", estado: "", conSaldo: false, page: 1, pageSize: 10 });
  const [revision, setRevision] = useState(0);
  const [data, setData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    getServicios(query, controller.signal).then(result => { if (!controller.signal.aborted) { setData(result); setLoading(false); } })
      .catch(err => { if (err.name !== "AbortError") { setError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, [query, revision]);
  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    getServicio(selectedId, controller.signal).then(result => { if (!controller.signal.aborted) setSelected(result); })
      .catch(err => { if (err.name !== "AbortError") setError(err.message); });
    return () => controller.abort();
  }, [selectedId]);
  const changed = (result) => { setSelected(result); setRevision(r => r + 1); };
  const apply = (next) => { setLoading(true); setError(""); setQuery(next); };
  return <MainLayout><main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-gray-900 dark:text-neutral-100">
    <header className="flex flex-wrap justify-between gap-4"><div><h1 className="text-2xl sm:text-3xl font-semibold">Servicios</h1><p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Contrataciones, abonos y seguimiento del saldo pendiente.</p></div>{!selectedId && !creating && <button className={buttonClass} onClick={() => setCreating(true)}>Registrar servicio</button>}</header>
    {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
    {creating ? <ServicioForm onCancel={() => setCreating(false)} onSave={s => { setCreating(false); setSelected(s); setSelectedId(s.id); setRevision(r => r + 1); }} />
      : selectedId ? selected ? <ServicioDetalle key={selected.id} servicio={selected} onChange={changed} onBack={() => { setSelectedId(null); setSelected(null); setError(""); }} /> : <div><p role="status">Cargando servicio...</p><button className={secondaryClass} onClick={() => { setSelectedId(null); setError(""); }}>Volver al listado</button></div>
      : <>
        <form className={`${panelClass} grid sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end`} onSubmit={e => { e.preventDefault(); apply({ ...query, ...filters, page: 1 }); }}>
          <Field label="Buscar persona, empresa o servicio"><input className={inputClass} value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} /></Field>
          <Field label="Estado del trabajo"><select className={inputClass} value={filters.estado} onChange={e => setFilters({ ...filters, estado: e.target.value })}><option value="">Todos los estados</option>{estados.map(s => <option key={s}>{s}</option>)}</select></Field>
          <label className="flex gap-2 items-center py-3 text-sm"><input type="checkbox" checked={filters.conSaldo} onChange={e => setFilters({ ...filters, conSaldo: e.target.checked })} />Con saldo pendiente</label>
          <button className={buttonClass} disabled={loading}>Filtrar</button>
        </form>
        <section className={panelClass}>
          {loading ? <p role="status">Cargando servicios...</p> : !data?.items.length ? <p className="text-gray-500 dark:text-neutral-400">No hay servicios para mostrar con estos filtros.</p> : <>
            <div className="space-y-3 sm:hidden">
              {data.items.map(s => <article key={s.id} className="rounded-lg border border-gray-200 p-4 dark:border-neutral-700">
                <p className="font-medium">{s.tipoServicio}</p>
                <p className="mt-1 text-gray-500 dark:text-neutral-400">{s.nombre}</p>
                <button type="button" className="mt-4 w-full rounded-lg border border-blue-600 px-4 py-2.5 font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20" onClick={() => { setSelected(null); setSelectedId(s.id); setError(""); }}>Ver detalle</button>
              </article>)}
            </div>
            <div className="hidden overflow-x-auto sm:block"><table className="w-full text-left text-sm"><thead><tr>{["Servicio / contratista", "Trabajo", "Monto acordado", "Abonado", "Pendiente", "Pago", ""].map(h => <th key={h} className="p-3 text-gray-500 dark:text-neutral-400 font-medium">{h}</th>)}</tr></thead><tbody>{data.items.map(s => <tr key={s.id} className="border-t border-gray-200 dark:border-neutral-700"><td className="p-3"><p className="font-medium">{s.tipoServicio}</p><p className="text-gray-500 dark:text-neutral-400">{s.nombre}</p><p className="text-xs text-gray-500 dark:text-neutral-400">{date(s.fechaContratacion)}</p></td><td className="p-3">{s.estado}</td><td className="p-3 whitespace-nowrap">{money(s.montoAcordado)}</td><td className="p-3 whitespace-nowrap">{money(s.totalAbonado)}</td><td className="p-3 font-semibold whitespace-nowrap">{money(s.saldoPendiente)}</td><td className="p-3">{s.estadoPago}</td><td className="p-3"><button type="button" className="text-blue-600 dark:text-blue-400 underline whitespace-nowrap" onClick={() => { setSelected(null); setSelectedId(s.id); setError(""); }}>Ver detalle</button></td></tr>)}</tbody></table></div>
            <Pagination paginaActual={data.page} totalPaginas={data.totalPages} totalItems={data.totalItems} pageSize={data.pageSize} onChangePagina={page => apply({ ...query, page })} />
          </>}
        </section>
      </>}
  </main></MainLayout>;
}
