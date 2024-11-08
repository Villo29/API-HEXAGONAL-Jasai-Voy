import amqp from 'amqplib';


export async function publishEvent(queue: string, eventData: any) {
    try {
        const connection = await amqp.connect('amqp://villo:cereza29@35.173.19.98:5672');
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

