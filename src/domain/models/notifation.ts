import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db';

// Definir la interfaz para el modelo Payment
export interface IPayment {
    id?: number;
    payment_id: number;
    status_detail: string;
    currency_id: string;
    total_paid_amount: number;
    date_created?: Date;
}

// Definir el modelo Payment
class Payment extends Model<IPayment> implements IPayment {
    public id!: number;
    public payment_id!: number;
    public status_detail!: string;
    public currency_id!: string;
    public total_paid_amount!: number;
    public date_created!: Date;
}

// Inicializar el modelo Payment con Sequelize
Payment.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        payment_id: {
            type: DataTypes.BIGINT,
            allowNull: false,
            unique: true,
        },
        status_detail: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        currency_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        total_paid_amount: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
        date_created: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    },
    {
        sequelize, // Conexión a la base de datos
        tableName: 'payments',
        modelName: 'Payment',
        timestamps: false, // Desactivar las columnas createdAt y updatedAt
    }
);

export default Payment;
