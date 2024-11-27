import { Client } from 'pg';
import dotenv from 'dotenv';
import cloudinary from '../../application/services/cloudinary'; // Importa la configuración de Cloudinary
dotenv.config();

export const client = new Client({
    user: process.env.PG_USER || '',
    host: process.env.PG_HOST || 'localhost',
    database: process.env.PG_DB || '',
    password: process.env.PG_PASSWORD || '',
    port: Number(process.env.PG_PORT) || 5432,
    ssl: {
        rejectUnauthorized: false,
    },
});

client.connect()
    .then(() => console.log('Conectado a la base de datos PostgreSQL exitosamente.'))
    .catch((error) => console.error('Error al conectar a la base de datos PostgreSQL:', error));

export interface IUsuario {
    id?: number;
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    codigo_verificacion: string | null;
    imagen_url?: string;
    fecha_operacion?: Date;
}

class Usuario {
    public static async crear(usuario: IUsuario): Promise<void> {
        const query = `
            INSERT INTO usuarios (nombre, correo, contrasena, telefono, codigo_verificacion, imagen_url, fecha_operacion)
            VALUES ($1, $2, $3, $4, $5, $6, NOW())
            RETURNING id
        `;
        const values = [
            usuario.nombre,
            usuario.correo,
            usuario.contrasena,
            usuario.telefono,
            usuario.codigo_verificacion,
            usuario.imagen_url,
        ];

        try {
            const res = await client.query(query, values);
            console.log('Usuario creado con ID:', res.rows[0].id);
        } catch (error) {
            console.error('Error al crear el usuario:', error);
        }
    }

    public static async subirImagen(imagenPath: string): Promise<string | null> {
        try {
            const result = await cloudinary.uploader.upload(imagenPath, {
                folder: 'usuarios',
            });
            console.log('Imagen subida a Cloudinary:', result.secure_url);
            return result.secure_url;
        } catch (error) {
            console.error('Error al subir la imagen a Cloudinary:', error);
            return null;
        }
    }

    public static async actualizar(id: number, datos: Partial<IUsuario>): Promise<void> {
        const fields = Object.keys(datos).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(datos)];
        const query = `UPDATE usuarios SET ${fields} WHERE id = $1`;
        try {
            await client.query(query, values);
            console.log(`Usuario con ID ${id} actualizado correctamente.`);
        } catch (error) {
            console.error('Error al actualizar el usuario:', error);
        }
    }

    public static async obtenerRideRequests(): Promise<any[]> {
        const query = `
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
                LENGTH(rr.phone_number) = 10
                AND LENGTH(u.telefono) = 10
        `;

        try {
            const res = await client.query(query);
            console.log('Ride requests obtenidas:', res.rows);
            return res.rows;
        } catch (error) {
            console.error('Error al obtener ride requests:', error);
            throw error;
        }
    }

}

export default Usuario;
