import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db';


export interface IPayment {
    id?: number;
    payment_id: number;
    status_detail: string;
    currency_id: string;
    total_paid_amount: number;
    date_created?: Date;
}

class Payment extends Model<IPayment> implements IPayment {
    public id!: number;
    public payment_id!: number;
    public status_detail!: string;
    public currency_id!: string;
    public total_paid_amount!: number;
    public date_created!: Date;
}

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
        sequelize,
        tableName: 'payments',
        modelName: 'Payment',
        timestamps: false,
    }
);

export default Payment;
