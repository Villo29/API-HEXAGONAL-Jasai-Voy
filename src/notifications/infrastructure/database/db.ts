import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(
    process.env.MYSQL_DB || '',
    process.env.MYSQL_USER || '',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        dialect: 'mysql',
        logging: false,
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


export default sequelize;
