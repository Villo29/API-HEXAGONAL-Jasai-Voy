import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../infrastructure/database/db';

// Definir la interfaz para el modelo Message
export interface IMessage {
    id?: number;
    to: string;
    templateName: string;
    languageCode: string;
    fecha_operacion?: Date;
}

// Definir el modelo Message
class Message extends Model<IMessage> implements IMessage {
    public id!: number;
    public to!: string;
    public templateName!: string;
    public languageCode!: string;
    public fecha_operacion!: Date;
}

// Inicializar el modelo Message con Sequelize
Message.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        to: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        templateName: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        languageCode: {
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
        tableName: 'mensajes',
        modelName: 'Message',
        timestamps: false, // Desactivar las columnas createdAt y updatedAt
    }
);

export default Message;
