import { Request, Response } from "express";
import Chofer from "../../domain/models/chofer";
import jwt from "jsonwebtoken";

export class ChoferController {
  constructor() { }

  crearChofer = async (req: Request, res: Response) => {
    try {
      const chofer = await Chofer.create(req.body);
      const token = jwt.sign(
        { id: chofer.id },
        process.env.JWT_SECRET || "your_secret_key"
      );
      res.status(201).send({ chofer, token });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  loginChofer = async (req: Request, res: Response) => {
    try {
      const { correo, contrasena } = req.body;
      const chofer = await Chofer.findOne({ where: { correo } });
      if (!chofer || chofer.contrasena !== contrasena) {
        return res.status(401).send({ error: "Credenciales no válidas." });
      }
      const token = jwt.sign(
        { id: chofer.id },
        process.env.JWT_SECRET || "your_secret_key"
      );
      res.send({ chofer, token });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  obtenerChoferes = async (req: Request, res: Response) => {
    try {
      const choferes = await Chofer.findAll();
      res.status(200).send(choferes);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  obtenerChoferPorId = async (req: Request, res: Response) => {
    const id = req.params.id;
    try {
      const chofer = await Chofer.findByPk(id);
      if (!chofer) {
        return res.status(404).send({ error: "Chofer no encontrado" });
      }
      res.status(200).send(chofer);
    } catch (error) {
      res.status(500).send(error);
    }
  };

  actualizarChofer = async (req: Request, res: Response) => {
    const updates = Object.keys(req.body) as Array<keyof typeof Chofer>;
    const allowedUpdates: Array<keyof Chofer> = [
      "nombre",
      "correo",
      "contrasena",
      "telefono",
      "curp"
    ];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update as keyof Chofer)
    );
    if (!isValidOperation) {
      return res.status(400).send({ error: "Actualización no permitida" });
    }
    try {
      const chofer = await Chofer.findByPk(req.params.id);
      if (!chofer) {
        return res.status(404).send({ error: "Chofer no encontrado" });
      }
      updates.forEach((update) => {
        (chofer as any)[update] = req.body[update];
      });
      await chofer.save();
      res.status(200).send(chofer);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  eliminarChofer = async (req: Request, res: Response) => {
    try {
      const chofer = await Chofer.findByPk(req.params.id);
      if (!chofer) {
        return res.status(404).send({ error: "Chofer no encontrado" });
      }
      await chofer.destroy();
      res.status(200).send(chofer);
    } catch (error) {
      res.status(500).send(error);
    }
  };
}

export const crearChofer = ChoferController.prototype.crearChofer;
export const loginChofer = ChoferController.prototype.loginChofer;
export const obtenerChoferes = ChoferController.prototype.obtenerChoferes;
export const obtenerChoferPorId = ChoferController.prototype.obtenerChoferPorId;
export const actualizarChofer = ChoferController.prototype.actualizarChofer;
export const eliminarChofer = ChoferController.prototype.eliminarChofer;
