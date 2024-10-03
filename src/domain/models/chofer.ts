import { Document, Schema, model } from 'mongoose';

// Definir la interfaz para el modelo Usuario
export interface IChofer extends Document {
    nombre: string;
    correo: string;
    contrasena: string;
    telefono: string;
    curp: string;

}

// Definir el esquema para el modelo Usuario
const choferSchema = new Schema<IChofer>({
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
});


const Chofer = model<IChofer>('Chofer', choferSchema);

export default Chofer;
