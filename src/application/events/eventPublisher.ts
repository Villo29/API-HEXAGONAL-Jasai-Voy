import amqp from 'amqplib';


export async function publishEvent(queue: string, eventData: any) {
    try {
        const rabbitmqUrl = process.env.RABBITMQ_URL;
        if (!rabbitmqUrl) {
            throw new Error("RABBITMQ_URL is not defined");
        }
        const connection = await amqp.connect(rabbitmqUrl);
        const channel = await connection.createChannel();
        await channel.assertQueue(queue, { durable: true });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(eventData)));
        console.log("Event published to queue:", queue);
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error("Error publishing event:", error);
    }
}

