import "./config";
import { sqs } from "./aws";

async function consumeMessages() {
  const params = {
    QueueUrl: process.env.SQS_QUEUE_URL!,
    MaxNumberOfMessages: 10,
  };

  const data = await sqs.receiveMessage(params).promise();
  if (data.Messages) {
    for (const message of data.Messages) {
      const body = JSON.parse(message.Body!);
      // console.log("Received message:\n", JSON.stringify(body, null, 2));

      if (body.Message) {
        const innerMessage = JSON.parse(body.Message);
        // console.log("\n\n");
        console.log("Inner message:\n", JSON.stringify(innerMessage, null, 2));
      }

      await sqs
        .deleteMessage({
          QueueUrl: params.QueueUrl,
          ReceiptHandle: message.ReceiptHandle!,
        })
        .promise();
    }
  }
}

setInterval(consumeMessages, 2 * 1000); //2s
