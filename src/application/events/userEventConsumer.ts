import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "221263@ids.upchiapas.edu.mx",
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

async function startUserCreatedConsumer() {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined in the environment variables");
        }
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue('user_events_queue', { durable: true });

        console.log("Waiting for USER_CREATED events...");
        channel.consume('user_events_queue', async (msg) => {
            if (msg !== null) {
                try {
                    const event = JSON.parse(msg.content.toString());
                    console.log("Tipo de evento recibido:", event.type);
                    if (event.type === "USER_CREATED") {
                        const { nombre, correo, codigo_verificacion } = event.data;
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

                        const info = await transporter.sendMail(mailOptions);
                        console.log(`Correo de bienvenida enviado a ${correo}: ${info.messageId}`);
                    } else {
                        console.log("Tipo de evento desconocido:", event.type);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error("Error al procesar el mensaje:", error);
                    channel.nack(msg, false, false);
                }
            }
        });
    } catch (error) {
        console.error("Error en el consumidor de eventos:", error);
    }
}

startUserCreatedConsumer();
