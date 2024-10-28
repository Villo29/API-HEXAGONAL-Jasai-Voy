import { Request, Response } from 'express';
import Usuario, { IUsuario } from '../../domain/models/usuario';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';



export class UserController {
    constructor() { }

    // Crear un nuevo usuario
    crearUsuario = async (req: Request, res: Response) => {
        try {
            const { nombre, correo, contrasena, telefono } = req.body;

            const correoExistente = await Usuario.findOne({ correo });
            if (correoExistente) {
                return res.status(400).json({ error: 'El correo ya está en uso.' });
            }

            const codigoVerificacion = crypto.randomBytes(3).toString('hex');
            const usuario = new Usuario({
                nombre,
                correo,
                contrasena,
                telefono,
                codigoVerificacion,
            });

            await usuario.save();

            const token = jwt.sign(
                { _id: usuario._id },
                process.env.JWT_SECRET || 'your_secret_key'
            );

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: '221263@ids.upchiapas.edu.mx',
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: '221263@ids.upchiapas.edu.mx',
                to: correo,
                subject: '¡Bienvenido a nuestra plataforma!',
                text: `¡Hola ${nombre}!, tu código de verificación es: ${codigoVerificacion}`,
                html: `<div style="text-align: center; font-family: Arial, sans-serif;">
                            <h1>¡Hola ${nombre}!</h1>
                            <p>Gracias por unirte a nuestra plataforma. Tu código de verificación es:</p>
                            <div style="display: inline-block; padding: 10px; border: 2px solid #000; border-radius: 5px;">
                                <h2>${codigoVerificacion}</h2>
                            </div>
                        </div>`,
            };

            await transporter.sendMail(mailOptions);

            res.status(201).send({ token, nombre: usuario.nombre });
        } catch (error) {
            console.error('Error en crearUsuario:', error);
            res.status(500).send({ error: 'Error al crear el usuario o enviar el correo.', detalle: (error as any).message });
        }
    };

    // Validación de usuario y registro de última fecha de operación
    loginUsuario = async (req: Request, res: Response) => {
        try {
            const { correo, contrasena } = req.body;
            const usuario = await Usuario.findOne({ correo });

            if (!usuario || usuario.contrasena !== contrasena) {
                return res.status(401).send({ error: 'Credenciales no válidas.' });
            }

            usuario.fechaOperacion = new Date();
            await usuario.save();

            const token = jwt.sign({ _id: usuario._id }, process.env.JWT_SECRET || 'your_secret_key');
            res.send({ usuario, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };
    obtenerUsuarioPorId = async (req: Request, res: Response) => {
        const _id = req.params.id;
        try {
            const usuario = await Usuario.findById(_id);
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            usuario.fechaOperacion = new Date();
            await usuario.save();

            res.status(200).send(usuario);
        } catch (error) {
            res.status(500).send(error);
        }
    };


    actualizarUsuario = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body) as Array<keyof IUsuario>;
        const allowedUpdates: Array<keyof IUsuario> = ['nombre', 'correo', 'contrasena', 'telefono'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).send({ error: 'Actualización no permitida' });
        }

        try {
            const usuario = await Usuario.findById(req.params.id);
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            updates.forEach((update) => {
                (usuario as any)[update] = req.body[update];
            });
            usuario.fechaOperacion = new Date();  // Registrar la fecha y hora de la actualización
            await usuario.save();
            res.status(200).send(usuario);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    // Eliminar un usuario por ID (opcionalmente registra la operación)
    eliminarUsuario = async (req: Request, res: Response) => {
        try {
            const usuario = await Usuario.findByIdAndDelete(req.params.id);
            if (!usuario) {
                return res.status(404).send();
            }

            usuario.fechaOperacion = new Date();  // Registrar la fecha y hora de la eliminación
            await usuario.save();

            res.status(200).send(usuario);
        } catch (error) {
            res.status(500).send(error);
        }
    };
}


export const crearUsuario = UserController.prototype.crearUsuario;

export const obtenerUsuarioPorId = UserController.prototype.obtenerUsuarioPorId;

export const actualizarUsuario = UserController.prototype.actualizarUsuario;

export const eliminarUsuario = UserController.prototype.eliminarUsuario;

export const loginUsuario = UserController.prototype.loginUsuario;

