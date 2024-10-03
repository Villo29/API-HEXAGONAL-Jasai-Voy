import { Request, Response } from "express";
import Chofer, { IChofer } from "../../domain/models/chofer";
import jwt from "jsonwebtoken";



export class ChoferController {
  constructor() {}

  // Crear un nuevo usuario
  crearChofer = async (req: Request, res: Response) => {
    try {
      const usuarioC = new Chofer(req.body);
      await usuarioC.save();
      const token = jwt.sign(
        { _id: usuarioC._id },
        process.env.JWT_SECRET || "your_secret_key"
      );
      res.status(201).send({ usuarioC, token });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  //Vlidacion de usuario usando JWT
  loginChofer = async (req: Request, res: Response) => {
    try {
      const { correo, contrasena } = req.body;
      const usuario = await Chofer.findOne({ correo });
      if (!usuario || usuario.contrasena !== contrasena) {
        return res.status(401).send({ error: "Credenciales no válidas." });
      }
      const token = jwt.sign(
        { _id: usuario._id },
        process.env.JWT_SECRET || "your_secret_key"
      );
      res.send({ usuario, token });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  // Obtener todos los usuarios
  obtenerchofer = async (req: Request, res: Response) => {
    try {
      const usuarios = await Chofer.find({});
      res.status(200).send(usuarios);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  // Obtener un usuario por ID
  obtenerChoferPorId = async (req: Request, res: Response) => {
    const _id = req.params.id;
    try {
      const usuario = await Chofer.findById(_id);
      if (!usuario) {
        return res.status(404).send();
      }
      res.status(200).send(usuario);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  // Actualizar un usuario por ID
  actualizarChofer = async (req: Request, res: Response) => {
    const updates = Object.keys(req.body) as Array<keyof IChofer>;
    const allowedUpdates: Array<keyof IChofer> = [
      "nombre",
      "correo",
      "contrasena",
      "telefono",
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
      return res.status(400).send({ error: "Actualización no permitida" });
    }

    try {
      const usuario = await Chofer.findById(req.params.id);
      if (!usuario) {
        return res.status(404).send({ error: "Usuario no encontrado" });
      }

      updates.forEach((update) => {
        (usuario as any)[update] = req.body[update];
      });
      await usuario.save();
      res.status(200).send(usuario);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  // Eliminar un usuario por ID
  eliminarChofer = async (req: Request, res: Response) => {
    try {
      const usuario = await Chofer.findByIdAndDelete(req.params.id);
      if (!usuario) {
        return res.status(404).send();
      }
      res.status(200).send(usuario);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}




export const crearChofer =  ChoferController.prototype.crearChofer;
export const loginChofer = ChoferController.prototype.loginChofer;
export const obtenerChofer = ChoferController.prototype.obtenerchofer;
export const obtenerChoferPorId = ChoferController.prototype.obtenerChoferPorId;
export const actualizarChofer = ChoferController.prototype.actualizarChofer;
export const eliminarChofer = ChoferController.prototype.eliminarChofer;
