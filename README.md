Este proyecto es una API CRUD que utiliza arquitectura hexagonal para gestionar recursos y realizar operaciones sobre ellos. Está construido con Node.js, Express, y TypeScript, y utiliza tecnologías como MongoDB, AWS S3 y Mercado Pago.

## Características

- **Express**: Framework minimalista para Node.js.
- **MongoDB**: Base de datos NoSQL utilizada para el almacenamiento de datos.
- **JWT**: Manejo de autenticación mediante JSON Web Tokens.
- **Multer**: Manejo de archivos para subida a AWS S3.
- **Mercado Pago**: Integración de pagos.
- **Rate Limiting**: Protección de la API contra abusos de solicitudes.

## Requisitos

- Node.js
- MongoDB
- AWS Account (para S3)
- Mercado Pago Account (para procesar pagos)

## Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/Villo29/API-HEXAGONAL-Jasai-Voy.git

2. Instala las dependencias:
    npm install

3. Crea un archivo .env en la raíz del proyecto con las siguientes variables:

## Scripts
Iniciar el servidor en modo desarrollo:
    npm run dev

Iniciar el servidor:
    npm start


## Dependencias
@aws-sdk/client-s3
aws-sdk
axios
cors
dotenv
express
express-fileupload
express-rate-limit
joi
jsonwebtoken
mercadopago
mongoose
multer
shortid

## DevDependencies
@types/cors
@types/express
@types/joi
@types/jsonwebtoken
nodemon
ts-node
typescript