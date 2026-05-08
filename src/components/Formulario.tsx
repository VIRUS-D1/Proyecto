import React from "react";
import "./Formulario.css";
import type { FormData, FormErrors } from "../hooks/datos";

const CATEGORIAS = ["gel", "pastilla", "capsulas", "jarabe"];

const CAMPOS = [
  { name: "nombre", label: "Nombre", type: "text", placeholder: "Ej: Paracetamol 500mg" },
  { name: "descripcion", label: "Descripción", type: "text", placeholder: "Ej: Analgésico" },
  { name: "precio", label: "Precio (MXN)", type: "number", placeholder: "0.00", step: "0.01" },
  { name: "stock", label: "Stock (unidades)", type: "number", placeholder: "0", step: "1" },
];

interface Props {
  editingId: number | null;
  form: FormData;
  errors: FormErrors;
  saving: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function Formulario({ editingId, form, errors, saving, onChange, onSubmit, onCancel }: Props) {
  return (
    <div className="formulario-card">
      <div className="formulario-card__titulo">
        {editingId ? "Editar medicamento" : "Nuevo medicamento"}
      </div>
      <form onSubmit={onSubmit} noValidate>
        <div className="formulario-card__grid">
          {CAMPOS.map((c) => (
            <div key={c.name} className="formulario-card__campo">
              <label htmlFor={c.name}>{c.label}</label>
              <input
                id={c.name}
                name={c.name}
                type={c.type}
                placeholder={c.placeholder}
                value={form[c.name as keyof FormData]}
                onChange={onChange}
                step={c.step}
                min={c.type === "number" ? "0" : undefined}
                className={errors[c.name as keyof FormErrors] ? "input--error" : ""}
              />
              {errors[c.name as keyof FormErrors] && (
                <div className="formulario-card__error">{errors[c.name as keyof FormErrors]}</div>
              )}
            </div>
          ))} 

          <div className="formulario-card__campo">
            <label htmlFor="categoria">
              Categoría <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <select
              id="categoria"
              name="categoria"
              value={form.categoria}
              onChange={onChange}
              className={errors.categoria ? "input--error" : ""}
            >
              <option value="">— Selecciona una categoría —</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            {errors.categoria && <div className="formulario-card__error">{errors.categoria}</div>}
          </div>
        </div>

        <div className="formulario-card__acciones">
          <button type="submit" className="btn-guardar" disabled={saving}>
            {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar medicamento"}
          </button>
          <button type="button" className="btn-cancelar" onClick={onCancel}>Cancelar</button>
        </div>
      </form>
    </div>
  );
}