import { v2 as cloudinary } from 'cloudinary';

const subirImagenCloudinary = (buffer: Buffer, folder: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder },
            (error, result) => {
                if (error) return reject(error);
                resolve(result?.secure_url || '');
            }
        );
        stream.end(buffer);
    });
};

export default subirImagenCloudinary;
