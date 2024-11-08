import amqp from 'amqplib';

export async function publishEvent(eventType: string, eventData: any) {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined");
        }

        // Conectar a RabbitMQ
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();

        // Crear una cola específica para cada tipo de evento
        const queueName = `${eventType}_queue`;
        await channel.assertQueue(queueName, { durable: true });

        // Publicar el evento en la cola específica
        const messageBuffer = Buffer.from(JSON.stringify(eventData));
        channel.sendToQueue(queueName, messageBuffer);

        console.log(`Evento de tipo ${eventType} publicado en la cola: ${queueName}`, eventData);

        // Cerrar el canal y la conexión
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("Error al publicar el evento:", error);
    }
}