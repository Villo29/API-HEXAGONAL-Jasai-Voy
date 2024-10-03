import { Request, Response } from 'express';
import Carrito, { ICarrito } from '../../domain/models/carrito';

// Crear un nuevo item en el carrito
export const agregarAlCarrito = async (req: Request, res: Response) => {
  try {
    const { _id, nombre, localidad, correo,} = req.body;
    const nuevoCarrito = new Carrito({ _id, nombre, localidad, correo});
    await nuevoCarrito.save();
    res.status(201).send(nuevoCarrito);
  } catch (error) {
    res.status(400).send(error);
  }
};

// Obtener todos los items del carrito para un usuario
export const obtenerCarrito = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const carrito = await Carrito.find({ userId });
    res.status(200).send(carrito);
  } catch (error) {
    res.status(500).send(error);
  }
};

// Eliminar un item del carrito por ID
export const eliminarDelCarrito = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const carrito = await Carrito.findByIdAndDelete(id);
    if (!carrito) {
      return res.status(404).send();
    }
    res.status(200).send(carrito);
  } catch (error) {
    res.status(500).send(error);
  }
};
