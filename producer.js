const amqplib = require("amqplib");

const amqpUrl = process.env.AMQP_URL || "amqp://localhost:5673";

function processMessage(msg) {
  console.log(`Producer: ${msg}`);

  return msg;
}

(async () => {
  const connection = await amqplib.connect(amqpUrl);
  const channel = await connection.createChannel();
  const queue = "first_queue";
  const exchange = "logs";
  const routingKey = "first_case";
  const msg = `test msg ${new Date()}`;

  try {
    console.log("Publishing...");
    await channel.assertQueue(queue, { durable: true });
    await channel.assertExchange(exchange, "direct", {
      durable: true,
    });
    await channel.bindQueue(queue, exchange, routingKey);

    channel.publish(exchange, routingKey, Buffer.from(processMessage(msg)), {
      persistent: true,
    });
  } catch (error) {
    console.error(error);
  } finally {
    await channel.close();
    await connection.close();
  }

  process.exit(0);
})();
