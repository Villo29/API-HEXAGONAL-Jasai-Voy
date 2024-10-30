import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db';


export interface IUnidad {
    id?: number;
    placas: string;
    marca: string;
    modelo: string;
    anio: number;
    codigo_verificacion: string;
    fecha_operacion?: Date;
}


class Unidad extends Model<IUnidad> implements IUnidad {
    public id!: number;
    public placas!: string;
    public marca!: string;
    public modelo!: string;
    public anio!: number;
    public codigo_verificacion!: string;
    public fecha_operacion!: Date;
}

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
        sequelize,
        tableName: 'unidades',
        modelName: 'Unidad',
        timestamps: false,
    }
);

export default Unidad;
