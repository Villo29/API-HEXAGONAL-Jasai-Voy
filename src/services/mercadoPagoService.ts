import axios from 'axios';
import PaymentModel from '../domain/models/notifation';
import { sendWhatsAppMessage } from '../services/twilioService';
import { publishEvent } from '../application/events/eventPublisher';

const phoneStore: { [preferenceId: string]: string } = {};

export class MercadoPagoService {
    async createPayment(preferenceData: any) {
        try {
            console.log('Datos recibidos en createPayment:', preferenceData);
            const preferenceResponse = await axios.post('https://api.mercadopago.com/checkout/preferences', preferenceData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            });
            const linkDePago = preferenceResponse.data.init_point;
            const preferenceId = preferenceResponse.data.id;
            let telefono = preferenceData.payer?.phone?.number;
            console.log('Número de teléfono obtenido:', telefono);
            if (!telefono) {
                throw new Error('Número de teléfono no proporcionado en preferenceData.payer.phone');
            }
            telefono = telefono.startsWith('+') ? telefono : `+${telefono}`;
            phoneStore[preferenceId] = telefono;
            const numeroDestino = `whatsapp:${telefono}`;
            const mensajeWhatsApp = `Tu enlace de pago es el siguiente: ${linkDePago}`;
            await sendWhatsAppMessage(numeroDestino, mensajeWhatsApp);
            return preferenceResponse.data;
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error creando preferencia de pago:', error.message);
                throw new Error(`Error creando preferencia de pago: ${error.message}`);
            } else {
                console.error('Error desconocido creando preferencia de pago:', error);
                throw new Error('Error desconocido creando preferencia de pago');
            }
        }
    }

    async processWebhook(notificacion: any) {
        try {
            if (notificacion.topic === 'merchant_order' && notificacion.resource) {
                const mercadoPagoServiceInstance = new MercadoPagoService();
                const orderDetails = await mercadoPagoServiceInstance.getOrderDetails(notificacion.resource);
                console.log('Detalles de la orden recibidos:', orderDetails);
                if (orderDetails.payments && orderDetails.payments.length > 0) {
                    const payment = orderDetails.payments[0];
                    const statusDetail = payment.status_detail;
                    const currencyId = payment.currency_id;
                    const paymentId = payment.id;
                    const totalPaidAmount = payment.total_paid_amount;
                    const preferenceId = orderDetails.preference_id;
                    let payerPhone = phoneStore[preferenceId];
                    console.log('Número de teléfono recuperado de almacenamiento:', payerPhone);
                    payerPhone = payerPhone.startsWith('+') ? payerPhone : `+${payerPhone}`;
                    if (statusDetail && currencyId && paymentId && totalPaidAmount) {
                        await PaymentModel.create({
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
                        const eventData = {
                            type: "PAYMENT_ACCREDITED",
                            data: {
                                currencyId,
                                totalPaidAmount,
                                paymentId,
                                payerPhone
                            }
                        };
                        await publishEvent("payment_events", eventData);
                        console.log('Evento PAYMENT_ACCREDITED publicado en la cola payment_events.');
                        delete phoneStore[preferenceId];
                    } else {
                        console.log('Faltan algunos detalles del pago, no se guardó en la base de datos.');
                    }
                } else {
                    console.log('No se encontraron pagos en los detalles de la orden.');
                }
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error al procesar el webhook:', error.message);
            } else {
                console.error('Error desconocido al procesar el webhook:', error);
            }
            throw error;
        }
    }

    async getPayment(paymentId: string) {
        try {
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo detalles del pago:', error);
            throw error;
        }
    }

    async getPaymentDetails(paymentId: string) {
        try {
            const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error obteniendo detalles del pago:', error);
            throw error;
        }
    }

    async getOrderDetails(orderUrl: string) {
        try {
            const response = await axios.get(orderUrl, {
                headers: {
                    'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error obteniendo detalles de la orden: ${orderUrl}`, error);
            throw error;
        }
    }
}
