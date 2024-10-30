import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db';

// Definir la interfaz para el modelo Chofer (opcional para el tipado)
export interface IChofer {
    id?: number;
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    curp: string;
    codigo_verificacion: string;
    fecha_operacion?: Date;
}

// Definir el modelo Chofer
class Chofer extends Model<IChofer> implements IChofer {
    public id!: number;
    public nombre!: string;
    public correo!: string;
    public contrasena!: string;
    public telefono!: string;
    public curp!: string;
    public codigo_verificacion!: string;
    public fecha_operacion!: Date;
}

// Inicializar el modelo Chofer con Sequelize
Chofer.init(
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
        curp: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        codigo_verificacion: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        fecha_operacion: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize, // Conexión a la base de datos
        tableName: 'choferes',
        modelName: 'Chofer',
        timestamps: false, // Desactivar las columnas createdAt y updatedAt
    }
);

export default Chofer;
