import amqp from 'amqplib';
import { sendWhatsAppMessage } from '../../services/twilioService';
import 'dotenv/config';

async function startPaymentAccreditedConsumer() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined in environment variables");
        }
        // Conectar a RabbitMQ
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        // Asegurarse de que la cola esté configurada como durable
        const queueName = 'payment_events_queue';
        await channel.assertQueue(queueName, { durable: true });

        console.log(`Esperando eventos de PAYMENT_ACCREDITED en la cola ${queueName}...`);

        // Consumir eventos de la cola
        channel.consume(queueName, async (msg) => {
            if (msg !== null) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log("Evento recibido:", event);

                    // Verifica el tipo de evento
                    if (event.type === "PAYMENT_ACCREDITED") {
                        const { currencyId, totalPaidAmount, paymentId, payerPhone } = event.data;

                        // Enviar mensaje de WhatsApp si el número de teléfono está disponible
                        if (payerPhone) {
                            const numeroDestino = `whatsapp:${payerPhone}`;
                            const mensajeWhatsApp = `✅ *¡Pago Acreditado!*
                            \nTu pago de *${currencyId} ${totalPaidAmount}* ha sido acreditado con éxito.
                            \n👉 *ID de pago:* ${paymentId}`;

                            await sendWhatsAppMessage(numeroDestino, mensajeWhatsApp);
                            console.log('Mensaje de WhatsApp enviado al cliente:', payerPhone);
                        } else {
                            console.log('Número de teléfono no disponible para enviar el mensaje de WhatsApp.');
                        }
                    } else {
                        console.log("Tipo de evento desconocido:", event.type);
                    }

                    // Confirmar que el mensaje fue procesado
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error al procesar el evento PAYMENT_ACCREDITED:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error("Error en el consumidor de eventos de pago:", error);
    }
}

startPaymentAccreditedConsumer();
