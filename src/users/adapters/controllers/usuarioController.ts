import { Request, Response } from 'express';
import { client } from '../../infrastructure/database/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import subirImagenCloudinary from '../../application/services/subirImagenCloudinary';
import { publishEvent } from '../../../notifications/application/events/eventPublisher';


export class UserController {
    constructor() { }

    crearUsuario = async (req: Request, res: Response) => {
        try {
            const { nombre, correo, contrasena, telefono } = req.body;
            const file = req.file;

            const correoExistente = await client.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
            if (correoExistente.rows.length > 0) {
                return res.status(400).json({ error: 'El correo ya está en uso.' });
            }

            const hashedPassword = await bcrypt.hash(contrasena, 10);
            const codigo_verificacion = crypto.randomBytes(3).toString('hex');

            let imagenUrl = null;
            if (file) {
                try {
                    imagenUrl = await subirImagenCloudinary(file.buffer, 'usuarios');
                } catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    return res.status(500).json({ error: 'Error al subir la imagen.' });
                }
            }
            const result = await client.query(
                `INSERT INTO usuarios (nombre, correo, contrasena, telefono, codigo_verificacion, imagen_url, fecha_operacion)
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
                [nombre, correo, hashedPassword, telefono, codigo_verificacion, imagenUrl]
            );

            const usuarioId = result.rows[0].id;
            const token = jwt.sign({ _id: usuarioId }, process.env.JWT_SECRET || 'your_secret_key');
            const eventData = {
                type: "USER_CREATED",
                data: {
                    nombre,
                    correo,
                    codigo_verificacion,
                    imagenUrl
                },
            };
            await publishEvent("user_events", eventData);

            res.status(201).send({ token, id: usuarioId, imagenUrl });
        } catch (error) {
            console.error('Error en crearUsuario:', error);
            res.status(500).send({ error: 'Error al crear el usuario o subir la imagen.', detalle: (error as any).message });
        }
    };

    loginUsuario = async (req: Request, res: Response) => {
        try {
            const { correo, contrasena } = req.body;
            const result = await client.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
            const usuario = result.rows[0];
            if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
                return res.status(401).send({ error: 'Credenciales no válidas.' });
            }
            const codigoVerificacion = crypto.randomBytes(3).toString('hex');
            await client.query(`UPDATE usuarios SET codigo_verificacion = $1, fecha_operacion = NOW() WHERE id = $2`, [codigoVerificacion, usuario.id]);
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
                html: `<div style="text-align: center; font-family: Arial, sans-serif;">
                    <h1>¡Hola ${usuario.nombre}!</h1>
                    <p>Haz intentado iniciar sesión. Tu código de verificación es:</p>
                    <div style="display: inline-block; padding: 10px; border: 2px solid #000; border-radius: 5px;">
                    <h2>${codigoVerificacion}</h2>
                    </div>
                </div>`,
            };
            await transporter.sendMail(mailOptions);

            res.status(200).send({ message: 'Código de verificación enviado al correo electrónico.' });
        } catch (error) {
            console.error('Error en loginUsuario:', error);
            res.status(500).send({ error: 'Error en el servidor.', detalle: (error as any).message });
        }
    };

    verificarCodigo = async (req: Request, res: Response) => {
        try {
            const { correo, codigoVerificacion } = req.body;
            const result = await client.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
            const usuario = result.rows[0];
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado.' });
            }
            if (usuario.codigo_verificacion !== codigoVerificacion.trim()) {
                return res.status(401).send({ error: 'Código de verificación no válido.' });
            }
            const token = jwt.sign({ _id: usuario.id }, process.env.JWT_SECRET || 'your_secret_key');
            await client.query(`UPDATE usuarios SET codigo_verificacion = NULL WHERE id = $1`, [usuario.id]);

            res.send({ usuario, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    obtenerUsuarioPorId = async (req: Request, res: Response) => {
        const _id = parseInt(req.params.id);
        try {
            const result = await client.query(`SELECT * FROM usuarios WHERE id = $1`, [_id]);
            const usuario = result.rows[0];
            if (!usuario) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }
            await client.query(`UPDATE usuarios SET fecha_operacion = NOW() WHERE id = $1`, [_id]);
            res.status(200).send(usuario);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    actualizarUsuario = async (req: Request, res: Response) => {
        const _id = parseInt(req.params.id);
        const { nombre, correo, contrasena, telefono } = req.body;
        try {
            await client.query(
                `UPDATE usuarios SET nombre = $1, correo = $2, contrasena = $3, telefono = $4, fecha_operacion = NOW() WHERE id = $5`,
                [nombre, correo, await bcrypt.hash(contrasena, 10), telefono, _id]
            );
            res.status(200).send({ message: 'Usuario actualizado correctamente.' });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    eliminarUsuario = async (req: Request, res: Response) => {
        const _id = parseInt(req.params.id);
        try {
            const result = await client.query(`DELETE FROM usuarios WHERE id = $1 RETURNING *`, [_id]);
            if (result.rowCount === 0) {
                return res.status(404).send({ error: 'Usuario no encontrado' });
            }
            res.status(200).send({ message: 'Usuario eliminado correctamente.' });
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
