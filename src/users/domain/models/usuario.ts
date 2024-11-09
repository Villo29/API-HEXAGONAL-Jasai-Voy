import { Client } from 'pg';
import dotenv from 'dotenv';
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
    fecha_operacion?: Date;
}

class Usuario {
    public static async crear(usuario: IUsuario): Promise<void> {
        const query = `
            INSERT INTO usuarios (nombre, correo, contrasena, telefono, codigo_verificacion, fecha_operacion)
            VALUES ($1, $2, $3, $4, $5, NOW())
            RETURNING id
        `;
        const values = [
            usuario.nombre,
            usuario.correo,
            usuario.contrasena,
            usuario.telefono,
            usuario.codigo_verificacion,
        ];

        try {
            const res = await client.query(query, values);
            console.log('Usuario creado con ID:', res.rows[0].id);
        } catch (error) {
            console.error('Error al crear el usuario:', error);
        }
    }

    public static async obtenerPorCorreo(correo: string): Promise<IUsuario | null> {
        const query = `SELECT * FROM usuarios WHERE correo = $1`;
        const values = [correo];

        try {
            const res = await client.query(query, values);
            return res.rows[0] || null;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
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

    public static async eliminar(id: number): Promise<void> {
        const query = `DELETE FROM usuarios WHERE id = $1`;
        const values = [id];
        try {
            await client.query(query, values);
            console.log(`Usuario con ID ${id} eliminado correctamente.`);
        } catch (error) {
            console.error('Error al eliminar el usuario:', error);
        }
    }
}

export default Usuario;
