import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db';

// Definir la interfaz para el modelo Unidad (opcional para el tipado)
export interface IUnidad {
    id?: number;
    placas: string;
    marca: string;
    modelo: string;
    anio: number;
    codigo_verificacion: string;
    fecha_operacion?: Date;
}

// Definir el modelo Unidad
class Unidad extends Model<IUnidad> implements IUnidad {
    public id!: number;
    public placas!: string;
    public marca!: string;
    public modelo!: string;
    public anio!: number;
    public codigo_verificacion!: string;
    public fecha_operacion!: Date;
}

// Inicializar el modelo Unidad con Sequelize
Unidad.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        placas: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        marca: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        modelo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        anio: {
            type: DataTypes.INTEGER,
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
        tableName: 'unidades',
        modelName: 'Unidad',
        timestamps: false, // Desactivar las columnas createdAt y updatedAt
    }
);

export default Unidad;
