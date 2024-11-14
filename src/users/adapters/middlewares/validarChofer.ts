import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const schema = Joi.object({
    nombre: Joi.string().min(3).required(),
    correo: Joi.string().email().required(),
    contrasena: Joi.string().min(6).required(),
    telefono: Joi.string().min(10).max(10).required(),
    curp: Joi.string().min(16).max(20).required(),
    matricula: Joi.string().min(10).max(15).required(),
});

export const validarChofer = (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send({ error: error.details[0].message });
    }
    next();
};
