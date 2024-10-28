import { Document, Schema, model } from 'mongoose';

// Definir la interfaz para el modelo Usuario
export interface IUsuario extends Document {
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    codigoVerificacion: string;
    fechaOperacion?: Date;
}

// Definir el esquema para el modelo Usuario
const usuarioSchema = new Schema<IUsuario>({
    nombre: {
        type: String,
        required: true,
    },
    correo: {
        type: String,
        required: true,
        unique: true,
    },
    contrasena: {
        type: String,
        required: true,
    },
    telefono: {
        type: String,
        required: true,
    },
    codigoVerificacion: {
        type: String,
        required: true,
    },
    fechaOperacion: {
        type: Date,
        default: Date.now
    }
});

usuarioSchema.pre<IUsuario>('save', function (next) {
    this.fechaOperacion = new Date();
    next();
});

// Definir el modelo Usuario
const Usuario = model<IUsuario>('Usuario', usuarioSchema);

export default Usuario;
