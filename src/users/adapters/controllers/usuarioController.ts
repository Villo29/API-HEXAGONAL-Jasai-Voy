import { Request, Response } from 'express';
import { client } from '../../infrastructure/database/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import subirImagenCloudinary from '../../application/services/subirImagenCloudinary';
import { publishEvent } from '../../../notifications/application/events/eventPublisher';
import logger from "../middlewares/loggerMiddleware";




export class UserController {
    constructor() { }

    crearUsuario = async (req: Request, res: Response) => {
        try {
            logger.info('Creating a new user');
            const { nombre, correo, contrasena, telefono } = req.body;
            const file = req.file;

            const correoExistente = await client.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
            if (correoExistente.rows.length > 0) {
                logger.warn('Attempt to create a user with an existing email');
                return res.status(400).json({ error: 'El correo ya está en uso.' });
            }

            const hashedPassword = await bcrypt.hash(contrasena, 10);
            const hashedPassword2 = await bcrypt.hash(correo, 10);
            const hashedPasswordPhone = await bcrypt.hash(telefono, 10);
            const codigo_verificacion = crypto.randomBytes(3).toString('hex');

            let imagenUrl = null;
            if (file) {
                try {
                    logger.info('Uploading user image to Cloudinary');
                    imagenUrl = await subirImagenCloudinary(file.buffer, 'usuarios');
                } catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    return res.status(500).json({ error: 'Error al subir la imagen.' });
                }
            }
            const result = await client.query(
                `INSERT INTO usuarios (nombre, correo, contrasena, telefono, codigo_verificacion, imagen_url, fecha_operacion)
                VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING id`,
                [nombre, hashedPassword2, hashedPassword, hashedPasswordPhone, codigo_verificacion, imagenUrl]
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

            logger.info(`User created successfully with ID: ${usuarioId}`);
            res.status(201).send({ token, id: usuarioId, imagenUrl });
        } catch (error) {
            logger.error('Error in crearUsuario: ', error);
            res.status(500).send({ error: 'Error al crear el usuario o subir la imagen.' });
        }
    };

    loginUsuario = async (req: Request, res: Response) => {
        try {
            logger.info('Login user');
            const { correo, contrasena } = req.body;
            const result = await client.query(`SELECT * FROM usuarios`);
            const usuarios = result.rows;
            // Compara el correo con los hashes almacenados
            let usuario = null;
            for (const u of usuarios) {
                if (await bcrypt.compare(correo, u.correo)) {
                    usuario = u;
                    break;
                }
            }
            if (!usuario || !(await bcrypt.compare(contrasena, usuario.contrasena))) {
                logger.warn('Invalid credentials');
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
                to: correo,
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
            logger.warn('Verification code sent to user email');
            res.status(200).send({ message: 'Código de verificación enviado al correo electrónico.' });
        } catch (error) {
            logger.warn('Error in loginUsuario: ', error);
            res.status(500).send({ error: 'Error en el servidor.' });
        }
    };


    verificarCodigo = async (req: Request, res: Response) => {
        try {
            logger.warn('Verifying code');
            const { correo, codigoVerificacion } = req.body;
            const result = await client.query(`SELECT * FROM usuarios WHERE correo = $1`, [correo]);
            const usuario = result.rows[0];
            if (!usuario) {
                logger.warn('User not found');
                return res.status(404).send({ error: 'Usuario no encontrado.' });
            }
            if (usuario.codigo_verificacion !== codigoVerificacion.trim()) {
                logger.warn('Invalid verification code');
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
            const updates = [];
            const values = [];
            let placeholderIndex = 1;
            if (nombre) {
                updates.push(`nombre = $${placeholderIndex++}`);
                values.push(nombre);
            }
            if (correo) {
                updates.push(`correo = $${placeholderIndex++}`);
                values.push(correo);
            }
            if (contrasena) {
                updates.push(`contrasena = $${placeholderIndex++}`);
                values.push(await bcrypt.hash(contrasena, 10));
            }
            if (telefono) {
                updates.push(`telefono = $${placeholderIndex++}`);
                values.push(telefono);
            }
            updates.push(`fecha_operacion = NOW()`);
            values.push(_id);
            const query = `UPDATE usuarios SET ${updates.join(', ')} WHERE id = $${placeholderIndex}`;
            await client.query(query, values);
            res.status(200).send({ message: 'Usuario actualizado correctamente.' });
        } catch (error) {
            res.status(400).send({ message: 'Error al actualizar el usuario.' });
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

    obtenerDetallesDeViajes = async (req: Request, res: Response) => {
        const { telefono } = req.body;

        if (!telefono || typeof telefono !== 'string' || telefono.length !== 10) {
            return res.status(400).json({ error: 'Debe proporcionar un número de teléfono válido de 10 dígitos.' });
        }

        try {
            const result = await client.query(`
                SELECT
                    rr.passenger_name,
                    rr.start_latitude,
                    rr.start_longitude,
                    rr.destination_latitude,
                    rr.destination_longitude
                FROM
                    ride_requests rr
                INNER JOIN
                    usuarios u
                ON
                    rr.phone_number = u.telefono
                WHERE
                    rr.phone_number = $1
                    AND u.telefono = $1
                    AND LENGTH(rr.phone_number) = 10
                    AND LENGTH(u.telefono) = 10;
            `, [telefono]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'No se encontraron registros para este número de teléfono.' });
            }

            res.status(200).json(result.rows);
        } catch (error) {
            console.error('Error en obtenerDetallesDeViajes:', error);
            res.status(500).json({ error: 'Error al obtener los detalles de los viajes.' });
        }
    };



}

export const crearUsuario = UserController.prototype.crearUsuario;
export const verificarCodigo = UserController.prototype.verificarCodigo;
export const obtenerUsuarioPorId = UserController.prototype.obtenerUsuarioPorId;
export const actualizarUsuario = UserController.prototype.actualizarUsuario;
export const eliminarUsuario = UserController.prototype.eliminarUsuario;
export const obtenerDetallesDeViajes = UserController.prototype.obtenerDetallesDeViajes;
export const loginUsuario = UserController.prototype.loginUsuario;
