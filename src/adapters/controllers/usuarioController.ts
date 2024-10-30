import { Request, Response } from 'express';
import Usuario from '../../domain/models/usuario'; // Sequelize Model importado
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export class UserController {
    constructor() { }

    // Crear un nuevo usuario
    crearUsuario = async (req: Request, res: Response) => {
        try {
            const { nombre, correo, contrasena, telefono } = req.body;

            const correoExistente = await Usuario.findOne({ where: { correo } });
            if (correoExistente) {
                return res.status(400).json({ error: 'El correo ya está en uso.' });
            }

            const codigo_verificacion = crypto.randomBytes(3).toString('hex');
            const usuario = await Usuario.create({
                nombre,
                correo,
                contrasena,
                telefono,
                codigo_verificacion,
            });

            const token = jwt.sign(
                { id: usuario.id },
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
                text: `¡Hola ${nombre}!, tu código de verificación es: ${codigo_verificacion}`,
                html: `<div style="text-align: center; font-family: Arial, sans-serif;">
                            <h1>¡Hola ${nombre}!</h1>
                            <p>Gracias por unirte a nuestra plataforma. Tu código de verificación es:</p>
                            <div style="display: inline-block; padding: 10px; border: 2px solid #000; border-radius: 5px;">
                                <h2>${codigo_verificacion}</h2>
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
            const usuario = await Usuario.findOne({ where: { correo } });

            if (!usuario || usuario.contrasena !== contrasena) {
                return res.status(401).send({ error: 'Credenciales no válidas.' });
            }

            usuario.fecha_operacion	 = new Date();
            await usuario.save();

            const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET || 'your_secret_key');
            res.send({ usuario, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    obtenerUsuarioPorId = async (req: Request, res: Response) => {
        const id = req.params.id;
        try {
            const usuario = await Usuario.findByPk(id);
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            usuario.fecha_operacion	 = new Date();
            await usuario.save();

            res.status(200).send(usuario);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    actualizarUsuario = async (req: Request, res: Response) => {
        const updates = Object.keys(req.body) as Array<keyof typeof Usuario>;
        const allowedUpdates: Array<keyof Usuario> = ['nombre', 'correo', 'contrasena', 'telefono'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update as keyof Usuario));
        if (!isValidOperation) {
            return res.status(400).send({ error: 'Actualización no permitida' });
        }

        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }

            updates.forEach((update) => {
                (usuario as any)[update] = req.body[update];
            });
            usuario.fecha_operacion	 = new Date();  // Registrar la fecha y hora de la actualización
            await usuario.save();
            res.status(200).send(usuario);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    eliminarUsuario = async (req: Request, res: Response) => {
        try {
            const usuario = await Usuario.findByPk(req.params.id);
            if (!usuario) {
                return res.status(404).send();
            }

            await usuario.destroy();
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
