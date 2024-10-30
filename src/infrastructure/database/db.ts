import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.MYSQL_DB || '', // Nombre de la base de datos
    process.env.MYSQL_USER || '', // Usuario de la base de datos
    process.env.MYSQL_PASSWORD || '', // Contraseña del usuario de la base de datos
    {
        host: process.env.MYSQL_HOST || 'localhost', // Dirección del servidor de MySQL
        dialect: 'mysql', // Dialecto que estamos utilizando (MySQL)
        logging: false, // Desactivar el registro de las consultas SQL (opcional)
    }
);

// Autenticación de la conexión
sequelize.authenticate()
    .then(() => {
        console.log('Conectado a la base de datos MySQL exitosamente.');
    })
    .catch((error) => {
        console.error('Error al conectar a la base de datos MySQL:', error);
    });

// Exportar la conexión para usar en los modelos
export default sequelize;
