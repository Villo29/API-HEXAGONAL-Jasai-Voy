import { Document, Schema, model } from "mongoose";


export interface IUnidad extends Document {
    placas: string;
    marca: string;
    modelo: string;
    año: number;
}


const unidadSchema = new Schema<IUnidad>({
    placas: {
        type: String,
        required: true,
    },
    marca: {
        type: String,
        required: true,
    },
    modelo: {
        type: String,
        required: true,
    },
    año: {
        type: Number,
        required: true,
    },
});

const Unidad = model<IUnidad>('Unidad', unidadSchema);

export default Unidad;