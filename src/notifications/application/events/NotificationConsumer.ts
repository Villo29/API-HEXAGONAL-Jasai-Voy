import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import { sendWhatsAppMessage } from '../../services/twilioService';
import 'dotenv/config';

// Configuración del transporte de nodemailer para enviar correos
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '221263@ids.upchiapas.edu.mx',
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

async function startNotificationConsumer() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined in environment variables");
        }

        // Conectar a RabbitMQ y crear el canal
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('notification', { durable: true });

        console.log("Esperando eventos en la cola notification...");

        // Consumir eventos desde la cola `notification`
        channel.consume('notification', async (msg) => {
            if (msg !== null) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log("Evento recibido:", event);

                    // Verificar el tipo de evento en `event.data.type`
                    const eventType = event.data?.type;
                    if (eventType === "USER_CREATED") {
                        await handleUserCreated(event.data.data);  // Enviar datos del usuario al manejador
                    } else if (eventType === "PAYMENT_ACCREDITED") {
                        await handlePaymentAccredited(event.data.data); // Enviar datos del pago al manejador
                    } else {
                        console.log("Tipo de evento desconocido:", eventType);
                    }

                    // Confirmar que el mensaje fue procesado
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error al procesar el evento:", error);
                    channel.nack(msg, false, false); // Rechazar el mensaje sin reenviarlo
                }
            }
        });
    } catch (error) {
        console.error("Error en el consumidor de notificaciones:", error);
    }
}

// Manejar el evento USER_CREATED y enviar correo de bienvenida
async function handleUserCreated(data: any) {
    const { nombre, correo, codigo_verificacion } = data;
    console.log("Procesando evento USER_CREATED:", { nombre, correo, codigo_verificacion });

    const mailOptions = {
        from: '221263@ids.upchiapas.edu.mx',
        to: correo,
        subject: '¡Bienvenido a nuestra plataforma!',
        text: `¡Hola ${nombre}!, tu código de verificación es: ${codigo_verificacion}`,
        html: `<div style="text-align: center; font-family: Arial, sans-serif;">
                    <h1>¡Hola ${nombre}!</h1>
                    <p>Gracias por unirte a nuestra plataforma. Tu código de verificación es:</p>
                    <div style="display: inline-block; padding: 10px; border: 2px solid #000; border-radius: 5px;">
                        <h2>${codigo_verificacion}</h2>
                    </div>
                </div>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Correo de bienvenida enviado a ${correo}: ${info.messageId}`);
    } catch (error) {
        console.error("Error al enviar el correo de bienvenida:", error);
    }
}

// Manejar el evento PAYMENT_ACCREDITED y enviar mensaje de WhatsApp
async function handlePaymentAccredited(data: any) {
    const { currencyId, totalPaidAmount, paymentId, payerPhone } = data;

    if (payerPhone) {
        const numeroDestino = `whatsapp:${payerPhone}`;
        const mensajeWhatsApp = `✅ *¡Pago Acreditado!*
        \nTu pago de *${currencyId} ${totalPaidAmount}* ha sido acreditado con éxito.
        \n👉 *ID de pago:* ${paymentId}`;

        try {
            await sendWhatsAppMessage(numeroDestino, mensajeWhatsApp);
            console.log('Mensaje de WhatsApp enviado al cliente:', payerPhone);
        } catch (error) {
            console.error("Error al enviar el mensaje de WhatsApp:", error);
        }
    } else {
        console.log('Número de teléfono no disponible para enviar el mensaje de WhatsApp.');
    }
}

// Iniciar el consumidor combinado
startNotificationConsumer();
