import amqp from 'amqplib';

export async function publishEvent(eventType: string, eventData: any) {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined");
        }
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        const queueName = 'notification';
        await channel.assertQueue(queueName, { durable: true });
        const message = { type: eventType, data: eventData };
        const messageBuffer = Buffer.from(JSON.stringify(message));
        channel.sendToQueue(queueName, messageBuffer);
        console.log(`Evento de tipo ${eventType} publicado en la cola: ${queueName}`, message);

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("Error al publicar el evento:", error);
    }
}
