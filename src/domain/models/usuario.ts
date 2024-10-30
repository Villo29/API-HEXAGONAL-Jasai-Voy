import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db'; // Asegúrate de que esta sea la conexión correcta a la base de datos

// Definir la interfaz para el modelo Usuario (opcional, pero útil)
export interface IUsuario {
    id?: number;
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    codigo_verificacion: string;
    fecha_operacion	?: Date;
}

// Definir el modelo Usuario
class Usuario extends Model<IUsuario> implements IUsuario {
    public id!: number;
    public nombre!: string;
    public correo!: string;
    public contrasena!: string;
    public telefono!: string;
    public codigo_verificacion!: string;
    public fecha_operacion	!: Date;
}

// Inicializar el modelo Usuario con Sequelize
Usuario.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        nombre: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        correo: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        contrasena: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        codigo_verificacion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_operacion	: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize, // Conexión a la base de datos
        tableName: 'usuarios',
        modelName: 'Usuario',
        timestamps: false, // Desactiva las columnas `createdAt` y `updatedAt` si no las necesitas
    }
);

export default Usuario;
