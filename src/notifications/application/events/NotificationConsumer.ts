import amqp from 'amqplib';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import Notification from '../../domain/models/Notification';
import { sendWhatsAppMessage } from '../../services/twilioService';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: '221263@ids.upchiapas.edu.mx',
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

async function connectToMongoDB() {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is not defined in environment variables");
    await mongoose.connect(mongoUri);
    console.log("Conectado a MongoDB Atlas");
}

async function startNotificationConsumer() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined in environment variables");
        }

        await connectToMongoDB();

        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('notification', { durable: true });

        console.log("Esperando eventos en la cola notification...");

        channel.consume('notification', async (msg) => {
            if (msg !== null) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log("Evento recibido:", event);
                    const eventType = event.data?.type;
                    if (eventType === "USER_CREATED") {
                        await handleUserCreated(event.data.data);
                    } else if (eventType === "PAYMENT_ACCREDITED") {
                        await handlePaymentAccredited(event.data.data);
                    } else {
                        console.log("Tipo de evento desconocido:", eventType);
                    }
                    channel.ack(msg);
                } catch (error) {
                    console.error("Error al procesar el evento:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error("Error en el consumidor de notificaciones:", error);
    }
}

async function handleUserCreated(data: any) {
    const { nombre, correo, codigo_verificacion } = data;

    const notificationData = {
        user_id: correo,
        title: "Bienvenido a la plataforma",
        content: `¡Hola ${nombre}!, tu código de verificación es: ${codigo_verificacion}`,
        type: "USER_CREATED",
        service_type: "email",
    };

    await saveNotification(notificationData);

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

async function handlePaymentAccredited(data: any) {
    const { currencyId, totalPaidAmount, paymentId, payerPhone } = data;

    const notificationData = {
        user_id: payerPhone,
        title: "Pago Acreditado",
        content: `Tu pago de ${currencyId} ${totalPaidAmount} ha sido acreditado con éxito. ID de pago: ${paymentId}`,
        type: "PAYMENT_ACCREDITED",
        service_type: "whatsapp",
    };

    await saveNotification(notificationData);

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

async function saveNotification(notificationData: any) {
    try {
        const notification = new Notification(notificationData);
        await notification.save();
        console.log("Notificación guardada en MongoDB:", notificationData);
    } catch (error) {
        console.error("Error al guardar la notificación en MongoDB:", error);
    }
}

startNotificationConsumer();
