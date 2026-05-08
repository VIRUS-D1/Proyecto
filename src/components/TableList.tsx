import React from "react";
import "./TableList.css";
import type { Medicamento } from "../hooks/datos";
import { STOCK_CRITICO } from "../hooks/datos";

interface Props {
  medicamentos: Medicamento[];
  loading: boolean;
  busqueda: string;
  sortField: "nombre" | "precio";
  sortDir: "asc" | "desc";
  onBusqueda: (valor: string) => void;
  onSort: (field: "nombre" | "precio") => void;
  onEditar: (m: Medicamento) => void;
  onEliminar: (m: Medicamento) => void;
}

export default function TableList({ medicamentos, loading, busqueda, sortField, sortDir, onBusqueda, onSort, onEditar, onEliminar }: Props) {
  const filtrados = medicamentos
    .filter((m) =>
      m.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      m.descripcion.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) =>
      sortField === "nombre"
        ? (sortDir === "asc" ? a.nombre.localeCompare(b.nombre, "es") : b.nombre.localeCompare(a.nombre, "es"))
        : (sortDir === "asc" ? a.precio - b.precio : b.precio - a.precio)
    );

  const sortIcon = (field: "nombre" | "precio") =>
    sortField === field ? (sortDir === "asc" ? "↑" : "↓") : "↕";

  return (
    <>
      <div className="buscador-row">
        <div className="buscador">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => onBusqueda(e.target.value)}
          />
        </div>
        <div className="ordenar-controles">
          {(["nombre", "precio"] as const).map((field) => (
            <button
              key={field}
              className={`btn-orden ${sortField === field ? "activo" : ""}`}
              onClick={() => onSort(field)}
            >
              {field === "nombre" ? "A–Z Nombre" : "$ Precio"}
              <span className="flecha">{sortIcon(field)}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="tabla-card">
        <div className="tabla-card__header">
          <span className="tabla-card__titulo">Inventario de medicamentos</span>
          <span className="tabla-card__conteo">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="tabla-card__vacio">Cargando inventario...</div>
        ) : filtrados.length === 0 ? (
          <div className="tabla-card__vacio">
            {busqueda ? "No se encontraron resultados." : "No hay medicamentos. ¡Agrega el primero!"}
          </div>
        ) : (
          <div className="tabla-card__scroll">
            <table className="tabla">
              <thead>
                <tr>
                  <th>#</th>
                  <th className={`th-ordenable ${sortField === "nombre" ? "th-activo" : ""}`} onClick={() => onSort("nombre")}>
                    Nombre {sortIcon("nombre")}
                  </th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th className={`th-ordenable ${sortField === "precio" ? "th-activo" : ""}`} onClick={() => onSort("precio")}>
                    Precio {sortIcon("precio")}
                  </th>
                  <th>Stock</th>
                  <th>Valor</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((m, i) => {
                  const critico = m.stock <= STOCK_CRITICO;
                  return (
                    <tr key={m.id} className={critico ? "fila--critica" : ""}>
                      <td className="num-gris">{i + 1}</td>
                      <td className="tabla__nombre">{m.nombre}</td>
                      <td className="tabla__descripcion">{m.descripcion}</td>
                      <td>{m.categoria ?? "—"}</td>
                      <td className="tabla__precio">
                        ${Number(m.precio).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={`badge-stock ${critico ? "badge-stock--critico" : "badge-stock--ok"}`}>
                          {critico ? "⚠ " : ""}{m.stock}
                        </span>
                      </td>
                      <td className="tabla__valor">
                        ${(m.precio * m.stock).toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <div className="tabla__acciones">
                          <button className="btn-editar" onClick={() => onEditar(m)}>Editar</button>
                          <button className="btn-eliminar" onClick={() => onEliminar(m)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}