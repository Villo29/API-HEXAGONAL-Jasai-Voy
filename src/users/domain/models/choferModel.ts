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

// Interfaz para el modelo Chofer
export interface IChofer {
    id?: number;
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    curp: string;
    matricula: string;
    imagen_url?: string;
    fecha_creada?: Date;
}

// Clase Chofer para interactuar con la base de datos
class Chofer {
    // Método para crear un nuevo chofer
    public static async crear(chofer: IChofer): Promise<void> {
        const query = `
            INSERT INTO choferes (nombre, correo, contrasena, telefono, curp, matricula, fecha_creada)
            VALUES ($1, $2, $3, $4, $5, $6, $7,  NOW())
            RETURNING id
        `;
        const values = [
            chofer.nombre,
            chofer.correo,
            chofer.contrasena,
            chofer.telefono,
            chofer.curp,
            chofer.matricula,
            chofer.imagen_url,
        ];

        try {
            const res = await client.query(query, values);
            console.log('Chofer creado con ID:', res.rows[0].id);
        } catch (error) {
            console.error('Error al crear el chofer:', error);
        }
    }

    public static async subirImagen(imagenPath: string): Promise<string | null> {
        try {
            const result = await cloudinary.uploader.upload(imagenPath, {
                folder: 'chofer',
            });
            console.log('Imagen subida a Cloudinary:', result.secure_url);
            return result.secure_url;
        } catch (error) {
            console.error('Error al subir la imagen a Cloudinary:', error);
            return null;
        }
    }

    // Método para obtener un chofer por correo
    public static async obtenerPorCorreo(correo: string): Promise<IChofer | null> {
        const query = `SELECT * FROM choferes WHERE correo = $1`;
        const values = [correo];

        try {
            const res = await client.query(query, values);
            return res.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener el chofer:', error);
            return null;
        }
    }

    // Método para actualizar un chofer
    public static async actualizar(id: number, datos: Partial<IChofer>): Promise<void> {
        const fields = Object.keys(datos).map((key, index) => `${key} = $${index + 2}`).join(', ');
        const values = [id, ...Object.values(datos)];
        const query = `UPDATE choferes SET ${fields} WHERE id = $1`;
        try {
            await client.query(query, values);
            console.log(`Chofer con ID ${id} actualizado correctamente.`);
        } catch (error) {
            console.error('Error al actualizar el chofer:', error);
        }
    }

    // Método para eliminar un chofer
    public static async eliminar(id: number): Promise<void> {
        const query = `DELETE FROM choferes WHERE id = $1`;
        const values = [id];
        try {
            await client.query(query, values);
            console.log(`Chofer con ID ${id} eliminado correctamente.`);
        } catch (error) {
            console.error('Error al eliminar el chofer:', error);
        }
    }
}

export default Chofer;
