import { Request, Response } from 'express';
import Unidad from '../../domain/models/unidad';
import jwt from 'jsonwebtoken';

export class UnidadController {
    constructor() { }

    crearUnidad = async (req: Request, res: Response) => {
        try {
            const unidad = await Unidad.create(req.body);
            const token = jwt.sign(
                { id: unidad.id },
                process.env.JWT_SECRET || 'your_secret_key'
            );
            res.status(201).send({ unidad, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    obtenerUnidades = async (req: Request, res: Response) => {
        try {
            const unidades = await Unidad.findAll();
            res.status(200).send(unidades);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    obtenerUnidadPorId = async (req: Request, res: Response) => {
        const id = req.params.id;
        try {
            const unidad = await Unidad.findByPk(id);
            if (!unidad) {
                return res.status(404).send({ error: 'Unidad no encontrada' });
            }
            res.status(200).send(unidad);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    actualizarUnidad = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body) as Array<keyof typeof Unidad>;
        const allowedUpdates: Array<keyof Unidad> = [
            'placas',
            'marca',
            'modelo',
            'anio'
        ];
        const isValidOperation = updates.every((update) =>
            allowedUpdates.includes(update as keyof Unidad)
        );
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Actualización no permitida' });
        }
        try {
            const unidad = await Unidad.findByPk(req.params.id);
            if (!unidad) {
                return res.status(404).send({ error: 'Unidad no encontrada' });
            }
            updates.forEach((update) => {
                (unidad as any)[update] = req.body[update];
            });
            await unidad.save();
            res.status(200).send(unidad);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    eliminarUnidad = async (req: Request, res: Response) => {
        try {
            const unidad = await Unidad.findByPk(req.params.id);
            if (!unidad) {
                return res.status(404).send({ error: 'Unidad no encontrada' });
            }
            await unidad.destroy();
            res.status(200).send(unidad);
        } catch (error) {
            res.status(500).send(error);
        }
    };
}

export const crearUnidad = UnidadController.prototype.crearUnidad;
export const obtenerUnidades = UnidadController.prototype.obtenerUnidades;
export const obtenerUnidadPorId = UnidadController.prototype.obtenerUnidadPorId;
export const actualizarUnidad = UnidadController.prototype.actualizarUnidad;
export const eliminarUnidad = UnidadController.prototype.eliminarUnidad;
