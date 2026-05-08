import { useEffect, useState, useCallback } from "react";
import Formulario from "./components/Formulario";
import TableList from "./components/TableList";
import type { Medicamento, FormData, FormErrors } from "./hooks/datos";
import { traer, insertar, actualizar, eliminar, STOCK_CRITICO } from "./hooks/datos";
import "./hooks/datos.css";

const EMPTY_FORM: FormData = { nombre: "", descripcion: "", categoria: "", precio: "", stock: "" };

function validar(f: FormData): FormErrors {
  const e: FormErrors = {};
  if (!f.nombre.trim()) e.nombre = "El nombre es requerido";
  if (!f.descripcion.trim()) e.descripcion = "La descripción es requerida";
  if (!f.categoria) e.categoria = "La categoría es requerida";
  const precio = Number(f.precio);
  if (!f.precio || isNaN(precio) || precio <= 0) e.precio = "El precio debe ser mayor a 0";
  const stock = Number(f.stock);
  if (f.stock === "" || isNaN(stock) || !Number.isInteger(stock) || stock < 0)
    e.stock = "El stock debe ser un número entero no negativo";
  return e;
}

function App() {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Medicamento | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [sortField, setSortField] = useState<"nombre" | "precio">("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    setMedicamentos(await traer());
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const valorTotal = medicamentos.reduce((acc, m) => acc + m.precio * m.stock, 0);
  const criticos = medicamentos.filter((m) => m.stock <= STOCK_CRITICO).length;

  const handleSort = (field: "nombre" | "precio") => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if ((name === "precio" || name === "stock") && value !== "" && Number(value) < 0) return;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validar(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSaving(true);

    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      categoria: form.categoria,
      precio: parseFloat(form.precio),
      stock: parseInt(form.stock),
    };

    const ok = editingId !== null
      ? await actualizar(editingId, payload)
      : await insertar(payload);

    if (ok) {
      showToast(editingId ? "Medicamento actualizado correctamente" : "Medicamento agregado correctamente");
      setForm(EMPTY_FORM);
      setEditingId(null);
      setShowForm(false);
      await cargar();
    } else {
      showToast("Error al guardar el medicamento", "error");
    }
    setSaving(false);
  };

  const handleEditar = (m: Medicamento) => {
    setForm({
      nombre: m.nombre,
      descripcion: m.descripcion,
      categoria: m.categoria ?? "",
      precio: String(m.precio),
      stock: String(m.stock),
    });
    setEditingId(m.id);
    setErrors({});
    setShowForm(true);
  };

  const handleEliminar = async () => {
    if (!confirmDelete) return;
    const ok = await eliminar(confirmDelete.id);
    showToast(ok ? `"${confirmDelete.nombre}" eliminado` : "Error al eliminar", ok ? "success" : "error");
    setConfirmDelete(null);
    await cargar();
  };

  const cancelForm = () => { setForm(EMPTY_FORM); setEditingId(null); setErrors({}); setShowForm(false); };

  return (
    <div>
      <header className="header">
        <div className="header__logo">
          <div className="header__icono">V D</div>
          <div>
            <div className="header__titulo">VIRUS DRUGSTORE</div>
            <div className="header__subtitulo">Sistema de Inventario</div>
          </div>
        </div>
        <button
          className="header__btn-nuevo"
          onClick={() => { setShowForm(true); setEditingId(null); setForm(EMPTY_FORM); setErrors({}); }}
        >
        Nuevo medicamento
        </button>
      </header>

      <main className="contenedor">
        {toast && (
          <div className={`toast toast--${toast.type}`}>
            {toast.type === "error" ? "⚠ " : "✓ "}{toast.msg}
          </div>
        )}

        <div className="metricas">
          <div className="metrica-card">
            <div className="metrica-card__icono"></div>
            <div className="metrica-card__valor" style={{ color: "#000000" }}>{medicamentos.length}</div>
            <div className="metrica-card__label">Total medicamentos</div>
          </div>
          <div className="metrica-card">
            <div className="metrica-card__icono">$$</div>
            <div className="metrica-card__valor" style={{ color: "#000000" }}>
              ${valorTotal.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </div>
            <div className="metrica-card__label">Valor inventario</div>
          </div>
          <div className={`metrica-card ${criticos > 0 ? "metrica-card--alerta" : ""}`}>
            <div className="metrica-card__icono">⚠</div>
            <div className="metrica-card__valor" style={{ color: criticos > 0 ? "#b45309" : "#000000" }}>
              {criticos}
            </div>
            <div className="metrica-card__label">Stock crítico</div>
          </div>
          <div className="metrica-card">
            <div className="metrica-card__icono">✓</div>
            <div className="metrica-card__valor" style={{ color: "#000000" }}>{medicamentos.length - criticos}</div>
            <div className="metrica-card__label">Sin problemas</div>
          </div>
        </div>

        {criticos > 0 && (
          <div className="alerta-critica">
            ⚠ <strong>{criticos} medicamento{criticos !== 1 ? "s" : ""}</strong>{" "}
            con stock crítico (≤{STOCK_CRITICO} unidades). Considera reabastecer pronto.
          </div>
        )}

        <TableList
          medicamentos={medicamentos}
          loading={loading}
          busqueda={busqueda}
          sortField={sortField}
          sortDir={sortDir}
          onBusqueda={setBusqueda}
          onSort={handleSort}
          onEditar={handleEditar}
          onEliminar={setConfirmDelete}
        />
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={cancelForm}>
          <div className="modal modal--form" onClick={(e) => e.stopPropagation()}>
            <Formulario
              editingId={editingId}
              form={form}
              errors={errors}
              saving={saving}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onCancel={cancelForm}
            />
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal__icono">🗑</div>
            <div className="modal__titulo">Confirmar eliminación</div>
            <div className="modal__texto">
              ¿Estás seguro de eliminar <strong>{confirmDelete.nombre}</strong>? Esta acción no se puede deshacer.
            </div>
            <div className="modal__acciones">
              <button className="modal__btn-cancelar" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="modal__btn-confirmar" onClick={handleEliminar}>Sí, eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;