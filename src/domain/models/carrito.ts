import { Schema, Document, model } from "mongoose";

// Definir la interfaz para el modelo Carrito
export interface ICarrito extends Document {
  _id: string;
  nombre: string;
  localidad: string;
  correo: string;
  carrito: string;
}

// Definir el esquema para el modelo Carrito
const carritoSchema = new Schema<ICarrito>({
  _id: {
    type: String,
    required: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  localidad: {
    type: String,
    required: true,
  },
  correo: {
    type: String,
    required: true,
  },
});

// Definir el modelo Carrito
const Carrito = model<ICarrito>("Carrito", carritoSchema);

export default Carrito;
