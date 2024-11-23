import multer from 'multer';

const storage = multer.memoryStorage(); // Guardar temporalmente en memoria
const upload = multer({ storage });

export default upload;
