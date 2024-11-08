import { Request, Response } from 'express';
import Usuario, { IUsuario } from '../../domain/models/usuario';
import 'dotenv/config';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import { publishEvent } from '../../application/events/eventPublisher';



export class UserController {
    constructor() { }

    crearUsuario = async (req: Request, res: Response) => {
        try {
            const { nombre, correo, contrasena, telefono } = req.body;
            const correoExistente = await Usuario.findOne({ where: { correo } });
            if (correoExistente) {
                return res.status(400).json({ error: 'El correo ya está en uso.' });
            }
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(contrasena, saltRounds);
            const codigo_verificacion = crypto.randomBytes(3).toString('hex');
            const usuario = new Usuario({
                nombre,
                correo,
                contrasena: hashedPassword,
                telefono,
                codigo_verificacion,
            });
            await usuario.save();
            const token = jwt.sign(
                { _id: usuario.id },
                process.env.JWT_SECRET || 'your_secret_key'
            );
            const eventData = {
                type: "USER_CREATED",
                data: {
                    nombre,
                    correo,
                    codigo_verificacion,
                },
            };
            await publishEvent("user_events", eventData);
            res.status(201).send({ token, id: usuario.id });
        } catch (error) {
            console.error('Error en crearUsuario:', error);
            res.status(500).send({ error: 'Error al crear el usuario o enviar el correo.', detalle: (error as any).message });
        }
    };

    loginUsuario = async (req: Request, res: Response) => {
        try {
            const { correo, contrasena } = req.body;
            const usuario = await Usuario.findOne({ where: { correo } });
            if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
                return res.status(401).send({ error: 'Credenciales no válidas.' });
            }
            const codigoVerificacion = Math.floor(100000 + Math.random() * 900000).toString();
            usuario.codigo_verificacion = codigoVerificacion;
            usuario.fecha_operacion = new Date();
            await usuario.save();
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "221263@ids.upchiapas.edu.mx",
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: usuario.correo,
                subject: 'Código de verificación',
                text: `¡Hola ${usuario.nombre}!, tu código de verificación es: ${codigoVerificacion}`,
                html: `<div style="text-align: center; font-family: Arial, sans-serif;">
            <h1>¡Hola ${usuario.nombre}!</h1>
            <p>Haz intentado iniciar sesion. Tu código de verificación es:</p>
            <div style="display: inline-block; padding: 10px; border: 2px solid #000; border-radius: 5px;">
                <h2>${codigoVerificacion}</h2>
            </div>
        </div>`,
            };
            await transporter.sendMail(mailOptions);
            res.send({ message: 'Código de verificación enviado al correo electrónico.' });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    verificarCodigo = async (req: Request, res: Response) => {
        try {
            const { correo, codigoVerificacion } = req.body;
            const usuario = await Usuario.findOne({ where: { correo } });
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado.' });
            }
            if (usuario.codigo_verificacion !== codigoVerificacion.trim()) {
                return res.status(401).send({ error: 'Código de verificación no válido.' });
            }
            const token = jwt.sign({ _id: usuario.id }, process.env.JWT_SECRET || 'your_secret_key');
            usuario.codigo_verificacion = null;
            await usuario.save();
            res.send({ usuario, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    obtenerUsuarioPorId = async (req: Request, res: Response) => {
        const _id = req.params.id;
        try {
            const usuario = await Usuario.findOne({ where: { id: _id } });
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }
            usuario.fecha_operacion = new Date();
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
            const usuario = await Usuario.findOne({ where: { id: req.params.id } });
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }
            updates.forEach((update) => {
                (usuario as any)[update] = req.body[update];
            });
            usuario.fecha_operacion = new Date();
            await usuario.save();
            res.status(200).send(usuario);
        } catch (error) {
            res.status(400).send(error);
        }
    };

    eliminarUsuario = async (req: Request, res: Response) => {
        try {
            const usuario = await Usuario.destroy({ where: { id: req.params.id } });
            if (!usuario) {
                return res.status(404).send();
            }
            res.status(200).send(usuario);
        } catch (error) {
            res.status(500).send(error);
        }
    };
}


export const crearUsuario = UserController.prototype.crearUsuario;

export const verificarCodigo = UserController.prototype.verificarCodigo;

export const obtenerUsuarioPorId = UserController.prototype.obtenerUsuarioPorId;

export const actualizarUsuario = UserController.prototype.actualizarUsuario;

export const eliminarUsuario = UserController.prototype.eliminarUsuario;

export const loginUsuario = UserController.prototype.loginUsuario;

