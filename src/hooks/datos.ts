import { supabase } from "../utils/supa";

export const STOCK_CRITICO = 10;

export interface Medicamento {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string | null;
  precio: number;
  stock: number;
}

export interface FormData {
  nombre: string;
  descripcion: string;
  categoria: string;
  precio: string;
  stock: string;
}

export interface FormErrors {
  nombre?: string;
  descripcion?: string;
  categoria?: string;
  precio?: string;
  stock?: string;
}

export const traer = async (): Promise<Medicamento[]> => {
  const { data, error } = await supabase
    .from("farmacia")
    .select("id, nombre, descripcion, categoria, precio, stock")
    .order("nombre", { ascending: true });
  if (error) console.error("Error al traer datos:", error.message);
  return data || [];
};

export const insertar = async (payload: Omit<Medicamento, "id">): Promise<boolean> => {
  const { error } = await supabase
    .from("farmacia")
    .insert([{
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      categoria: payload.categoria,
      precio: payload.precio,
      stock: payload.stock,
    }]);
  if (error) console.error("Error al insertar:", error.message);
  return !error;
};

export const actualizar = async (id: number, payload: Omit<Medicamento, "id">): Promise<boolean> => {
  const { error } = await supabase
    .from("farmacia")
    .update({
      nombre: payload.nombre,
      descripcion: payload.descripcion,
      categoria: payload.categoria,
      precio: payload.precio,
      stock: payload.stock,
    })
    .eq("id", id);
  if (error) console.error("Error al actualizar:", error.message);
  return !error;
};

export const eliminar = async (id: number): Promise<boolean> => {
  const { error } = await supabase.from("farmacia").delete().eq("id", id);
  if (error) console.error("Error al eliminar:", error.message);
  return !error;
};