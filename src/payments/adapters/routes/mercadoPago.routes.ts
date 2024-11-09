import { Router, Request, Response } from 'express';
import { MercadoPagoService } from '../../services/mercadoPagoService';
import { sendWhatsAppMessage } from '../../services/twilioService';
import Payment from '../../domain/models/notifation';

const router = Router();
const mercadoPagoService = new MercadoPagoService();


router.post('/pago', async (req: Request, res: Response) => {
    try {
        const baseUrl = process.env.BASE_URL || '';
        const notificationUrl = `${baseUrl}/api/v1/mercado-pago/webhook`;
        console.log('Recibido preferenceData:', req.body);

        const preferenceData = {
            items: req.body.items,
            payer: {
                email: req.body.payer.email,
                phone: {
                    number: req.body.payer.phone.number
                }
            },
            back_urls: {
                success: `${baseUrl}/success`,
                failure: `${baseUrl}/failure`,
                pending: `${baseUrl}/pending`
            },
            notification_url: notificationUrl
        };

        console.log('Datos enviados a createPayment:', preferenceData);

        // Crear preferencia de pago usando el servicio
        const preferenceResponse = await mercadoPagoService.createPayment(preferenceData);

        return res.json({
            init_point: preferenceResponse.init_point,
            preference_id: preferenceResponse.id
        });
    } catch (error: any) {
        console.error('Error al procesar el pago:', error);
        res.status(500).json({ detail: error.message });
    }
});


router.post('/webhook', async (req: Request, res: Response) => {
    try {
        const notificacion = req.body;
        console.log('Recibida notificación:', notificacion);
        await mercadoPagoService.processWebhook(notificacion);
        if (notificacion.topic === 'merchant_order' && notificacion.resource) {
            const orderUrl = notificacion.resource;
            const orderDetails = await mercadoPagoService.getOrderDetails(orderUrl);
            console.log('Detalles de la orden recibidos:', orderDetails);

            if (orderDetails.order_status === 'paid') {
                const payment = orderDetails.payments[0];
                const paymentId = payment.id;
                const statusDetail = payment.status_detail;
                const currencyId = payment.currency_id;
                const totalPaidAmount = payment.total_paid_amount;
                const payerPhone = orderDetails.payer?.phone?.number;

                if (paymentId && statusDetail && currencyId && totalPaidAmount) {
                    await Payment.create({
                        payment_id: paymentId,
                        status_detail: statusDetail,
                        currency_id: currencyId,
                        total_paid_amount: totalPaidAmount
                    });
                    console.log('Detalles del pago guardados en la base de datos:', {
                        payment_id: paymentId,
                        status_detail: statusDetail,
                        currency_id: currencyId,
                        total_paid_amount: totalPaidAmount
                    });
                    if (payerPhone) {
                        const numeroDestino = `whatsapp:+${payerPhone}`;
                        const mensajeWhatsApp = `Tu pago de ${currencyId} ${totalPaidAmount} ha sido acreditado con éxito. ID de pago: ${paymentId}`;
                        await sendWhatsAppMessage(numeroDestino, mensajeWhatsApp);
                        console.log('Mensaje de WhatsApp enviado al cliente:', numeroDestino);
                    } else {
                        console.log('Número de teléfono no disponible para enviar el mensaje de WhatsApp.');
                    }
                } else {
                    console.log('Faltan algunos detalles del pago, no se guardó en la base de datos.');
                }
            } else {
                console.log('La orden no está en estado "paid"');
            }
        }

        return res.status(200).json({ status: 'ok' });
    } catch (error: any) {
        console.error('Error al recibir la notificación:', error.message);
        res.status(500).json({ detail: error.message });
    }
});

export default router;
