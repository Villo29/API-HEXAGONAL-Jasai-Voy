import { Request, Response } from 'express';
import { client } from '../../infrastructure/database/db';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import subirImagenCloudinary from '../../application/services/subirImagenCloudinary';
import { publishEvent } from '../../../notifications/application/events/eventPublisher';

export class driveController {
    constructor() {}

    // Crear un nuevo chofer
    crearChofer = async (req: Request, res: Response) => {
        try {
            const { nombre, correo, contrasena, telefono, curp, matricula } = req.body;
            const correoExistente = await client.query(`SELECT * FROM choferes WHERE correo = $1`, [correo]);
            const file = req.file;
            if (correoExistente.rows.length > 0) {
                return res.status(400).json({ error: 'El correo ya está en uso.' });
            }
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            const codigo_verificacion = crypto.randomBytes(3).toString('hex');

            let imagenUrl = null;
            if (file) {
                try {
                    imagenUrl = await subirImagenCloudinary(file.buffer, 'chofer');
                } catch (error) {
                    console.error('Error al subir la imagen a Cloudinary:', error);
                    return res.status(500).json({ error: 'Error al subir la imagen.' });
                }
            }
            const result = await client.query(
                `INSERT INTO choferes (nombre, correo, contrasena, telefono, curp, matricula, codigo_verificacion, imagen_url, fecha_creada)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING id`,
                [nombre, correo, hashedPassword, telefono, curp, matricula, codigo_verificacion, imagenUrl]
            );

            const choferId = result.rows[0].id;
            const token = jwt.sign({ _id: choferId }, process.env.JWT_SECRET || 'your_secret_key');

            const eventData = {
                type: "CHOFER_CREATED",
                data: { nombre, correo, codigo_verificacion, imagenUrl },
            };
            await publishEvent("user_events", eventData);

            res.status(201).send({ token, id: choferId, imagen_url: imagenUrl });
        } catch (error) {
            console.error('Error en crearChofer:', error);
            res.status(500).send({ error: 'Error al crear el chofer.', detalle: (error as any).message });
        }
    };

    // Login de chofer y envío de código de verificación por correo
    loginChofer = async (req: Request, res: Response) => {
        try {
            const { correo, contrasena } = req.body;
            const result = await client.query(`SELECT * FROM choferes WHERE correo = $1`, [correo]);
            const chofer = result.rows[0];

            if (!chofer || !(await bcrypt.compare(contrasena, chofer.contrasena))) {
                return res.status(401).send({ error: 'Credenciales no válidas.' });
            }

            const codigoVerificacion = crypto.randomBytes(3).toString('hex');
            await client.query(`UPDATE choferes SET codigo_verificacion = $1, fecha_creada = NOW() WHERE id = $2`, [codigoVerificacion, chofer.id]);

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "221263@ids.upchiapas.edu.mx",
                    pass: process.env.GMAIL_APP_PASSWORD,
                },
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: chofer.correo,
                subject: 'Código de verificación',
                html: `<div style="text-align: center; font-family: Arial, sans-serif;">
                        <h1>¡Hola ${chofer.nombre}!</h1>
                        <p>Tu código de verificación para iniciar sesión es:</p>
                        <div style="display: inline-block; padding: 10px; border: 2px solid #000; border-radius: 5px;">
                        <h2>${codigoVerificacion}</h2>
                        </div>
                    </div>`,
            };
            await transporter.sendMail(mailOptions);

            res.status(200).send({ message: 'Código de verificación enviado al correo electrónico.' });
        } catch (error) {
            console.error('Error en loginChofer:', error);
            res.status(500).send({ error: 'Error en el servidor.', detalle: (error as any).message });
        }
    };

    // Verificar código de verificación y generar JWT
    verificarCodigo = async (req: Request, res: Response) => {
        try {
            const { correo, codigoVerificacion } = req.body;
            const result = await client.query(`SELECT * FROM choferes WHERE correo = $1`, [correo]);
            const chofer = result.rows[0];
            if (!chofer) {
                return res.status(404).send({ error: 'Chofer no encontrado.' });
            }
            if (chofer.codigo_verificacion !== codigoVerificacion.trim()) {
                return res.status(401).send({ error: 'Código de verificación no válido.' });
            }

            const token = jwt.sign({ _id: chofer.id }, process.env.JWT_SECRET || 'your_secret_key');
            await client.query(`UPDATE choferes SET codigo_verificacion = NULL WHERE id = $1`, [chofer.id]);

            res.send({ chofer, token });
        } catch (error) {
            res.status(400).send(error);
        }
    };

    // Obtener chofer por ID
    obtenerChoferPorId = async (req: Request, res: Response) => {
        const _id = parseInt(req.params.id);
        try {
            const result = await client.query(`SELECT * FROM choferes WHERE id = $1`, [_id]);
            const chofer = result.rows[0];
            if (!chofer) {
                return res.status(404).send({ error: 'Chofer no encontrado' });
            }
            await client.query(`UPDATE choferes SET fecha_creada = NOW() WHERE id = $1`, [_id]);
            res.status(200).send(chofer);
        } catch (error) {
            res.status(500).send(error);
        }
    };

    // Actualizar chofer
    actualizarChofer = async (req: Request, res: Response) => {
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
            res.status(400).send({ message: 'Error al actualizar el usuario.', error: (error as any).message });
        }
    };

    // Eliminar chofer
    eliminarChofer = async (req: Request, res: Response) => {
        const _id = parseInt(req.params.id);
        try {
            const result = await client.query(`DELETE FROM choferes WHERE id = $1 RETURNING *`, [_id]);
            if (result.rowCount === 0) {
                return res.status(404).send({ error: 'Chofer no encontrado' });
            }
            res.status(200).send({ message: 'Chofer eliminado correctamente.' });
        } catch (error) {
            res.status(500).send(error);
        }
    };
}

export const crearChofer = driveController.prototype.crearChofer;
export const loginChofer = driveController.prototype.loginChofer;
export const verificarCodigo = driveController.prototype.verificarCodigo;
export const obtenerChoferPorId = driveController.prototype.obtenerChoferPorId;
export const actualizarChofer = driveController.prototype.actualizarChofer;
export const eliminarChofer = driveController.prototype.eliminarChofer;
