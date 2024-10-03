import express, { Request, Response } from 'express';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const router = express.Router();

// Step 1: Inicializar el cliente de Mercado Pago con el accessToken correcto
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '', // Asegúrate de usar el token correcto de producción
    options: { timeout: 5000 }  // Opciones adicionales
});

// Step 2: Inicializar la API de preferencias
const preference = new Preference(client);

// Ruta POST para generar el link de pago (init_point)
router.post('/pagar', async (req: Request, res: Response) => {
    try {
        // Step 3: Crear la preferencia de pago (esto no hace el pago, solo genera el link)
        const preferenceBody = {
            items: [
                {
                    id: 'product123',  // Identificador del producto
                    title: 'Producto de prueba',
                    quantity: 1,
                    unit_price: 85.00,  // Monto del producto
                }
            ],
            back_urls: {
                success: 'http://127.0.0.1:3029/api/v1/success',  // URL de éxito
                failure: 'http://127.0.0.1:3029/api/v1/failure',  // URL de fallo
                pending: 'http://127.0.0.1:3029/api/v1/pending'   // URL pendiente
            },
            auto_return: 'approved',  // Redirigir automáticamente si el pago es aprobado
        };

        // Crear la preferencia de pago
        const response = await preference.create({ body: preferenceBody });

        // Step 4: Obtener el init_point (el link de pago)
        const initPoint = response.init_point;  // Enlace de pago (Checkout Pro)

        // Step 5: Responder con el link de pago al cliente
        res.status(200).json({
            message: 'Link de pago generado exitosamente',
            init_point: initPoint  // Aquí tienes el link que puedes mostrar o redirigir
        });

    } catch (error: unknown) {
        if (error instanceof Error) {
            // Manejo explícito del error
            console.error('Error al generar el link de pago:', error.message);
            res.status(500).json({
                message: 'Error al generar el link de pago',
                error: error.message
            });
        } else {
            console.error('Error desconocido:', error);
            res.status(500).json({
                message: 'Error desconocido al generar el link de pago'
            });
        }
    }
});

export default router;
