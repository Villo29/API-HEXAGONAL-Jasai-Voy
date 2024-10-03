import express, { Request, Response } from 'express';
import PaymentProcessor from '../../domain/payments/PaymentProcessor';

const router = express.Router();
const paymentProcessor = new PaymentProcessor();

// Ruta POST para crear un pago y devolver solo el link del pago sin enviar datos
router.post('/pagar', async (req: Request, res: Response) => {
    try {
        // Generar el link de pago con valores predeterminados
        const paymentLink = await paymentProcessor.createPayment();

        // Devolver el link de pago en la respuesta
        res.status(200).json({
            message: 'Link de pago generado exitosamente',
            init_point: paymentLink.init_point,
        });
    } catch (error) {
        console.error('Error al generar el link de pago:', error);
        const errorMessage = (error as Error).message;
        res.status(500).json({ message: 'Error al generar el link de pago', error: errorMessage });
    }
});

export default router;
