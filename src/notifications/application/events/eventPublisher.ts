import amqp from 'amqplib';

export async function publishEvent(eventType: string, eventData: any) {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined");
        }
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        // Crear una sola cola 'notification' para todos los eventos
        const queueName = 'notification';
        await channel.assertQueue(queueName, { durable: true });

        // Incluir el tipo de evento en los datos enviados
        const message = { type: eventType, data: eventData };
        const messageBuffer = Buffer.from(JSON.stringify(message));

        // Publicar el evento en la cola 'notification'
        channel.sendToQueue(queueName, messageBuffer);
        console.log(`Evento de tipo ${eventType} publicado en la cola: ${queueName}`, message);

        // Cerrar el canal y la conexión
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("Error al publicar el evento:", error);
    }
}
