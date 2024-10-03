import { number } from "joi";
import { Document, Schema, model } from "mongoose";

export interface IEvento extends Document {
    nombre: string;
    descripcion: string;
    fecha: Date;
    vip: number;
    preferente: number;
    general: number;
    genero: string;
    imagen: string;
    lugar: string;
}

//deficnicion del esquema

const eventoSchema = new Schema<IEvento>({
    nombre: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    genero: {
        type: String,
        required: true
    },
    imagen: {
        type: String,
        required: true
    },
    lugar: {
        type: String,
        required: true
    },
    vip: {
        type: Number,
        required:true
    },
    general: {
        type: Number,
        required:true,
    },
    preferente:{
        type: Number,
        required:true
    }
});

const Evento = model<IEvento>('Evento', eventoSchema);

export default Evento;
