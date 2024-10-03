import { Request, Response } from 'express';
import Unidad, { IUnidad } from '../../domain/models/unidad';
import jwt from 'jsonwebtoken';


export class UnidadController {
    constructor() { }

    // Crear una nueva unidad
    crearUnidad = async (req: Request, res: Response) => {
        try {
            const unidad = new Unidad(req.body);
            await unidad.save();
            const token = jwt.sign(
                { _id: unidad._id },
                process.env.JWT_SECRET || 'your_secret_key'
            );
            res.status(201).send({ unidad, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };


    //obtener todas las unidades
    obtenerUnidades = async (req: Request, res: Response) => {
        try {
            const unidades = await Unidad.find({});
            res.status(200).send(unidades);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    // Obtener una unidad por ID
    obtenerUnidadPorId = async (req: Request, res: Response) => {
        const _id = req.params.id;
        try {
            const unidad = await Unidad.findById(_id);
            if (!unidad) {
                return res.status(404).send();
            }
            res.status(200).send(unidad);
        } catch (error) {
            res.status(500);
        }
    }


    // Actualizar una unidad por ID
    actualizarUnidad = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body) as Array<keyof IUnidad>;
        const allowedUpdates: Array<keyof IUnidad> = [
            "placas",
            "marca",
            "modelo",
        ];
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update)
        );

        if (!isValidOperation) {
            return res.status(400).send({ error: "Actualización no permitida" });
        }

        try {
            const usuario = await Unidad.findById(req.params.id);
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

    // Eliminar una unidad por ID
    eliminarUnidad = async (req: Request, res: Response) => {
        try {
            const unidad = await Unidad.findByIdAndDelete(req.params.id);
            if (!unidad) {
                return res.status(404).send({ error: "Unidad no encontrada" });
            }
            res.status(200).send(unidad);
        } catch (error) {
            res.status(500).send(error);
        }
    }

}

export const crearUnidad = UnidadController.prototype.crearUnidad;
export const obtenerUnidades = UnidadController.prototype.obtenerUnidades;
export const obtenerUnidadPorId = UnidadController.prototype.obtenerUnidadPorId;
export const actualizarUnidad = UnidadController.prototype.actualizarUnidad;
export const eliminarUnidad = UnidadController.prototype.eliminarUnidad;
