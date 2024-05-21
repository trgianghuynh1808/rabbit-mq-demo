const amqplib = require("amqplib");
const amqpUrl = process.env.AMQP_URL || "amqp://localhost:5673";

function processMessage(msg) {
  console.log(`Consumer: ${msg.content.toString()}`);

  return msg;
}

(async () => {
  const connection = await amqplib.connect(amqpUrl);
  const channel = await connection.createChannel();
  const queue = "first_queue";
  const exchange = "logs";
  const routingKey = "first_case";

  process.once("SIGINT", async () => {
    console.log("got sigint, closing connection");

    await channel.close();
    await connection.close();
    process.exit(0);
  });

  try {
    await channel.assertQueue(queue, { durable: true });
    await channel.assertExchange(exchange, "direct", { durable: true });

    // This config to allow cosume amount in per consumer
    channel.prefetch(1);

    await channel.consume(queue, async (msg) => {
      console.log("Consuming...");
      processMessage(msg);

      channel.ack(msg);
    });
  } catch (error) {
    console.error(error);
  } finally {
    console.log(" [*] Waiting for messages. To exit press CTRL+C");
  }
})();
