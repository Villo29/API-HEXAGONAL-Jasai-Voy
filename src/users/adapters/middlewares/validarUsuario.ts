import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const schema = Joi.object({
  nombre: Joi.string().min(3).required(),
  correo: Joi.string().email().required(),
  contrasena: Joi.string().min(6).required(),
  telefono: Joi.string().min(10).max(10).required(),
  imagen_url: Joi.any(),
});

export const validarUsuario = (req: Request, res: Response, next: NextFunction) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).send({
      error: "Validation Error",
      message: error.details[0].message,
      field: error.details[0].context?.key
    });
  }
  next();
};
