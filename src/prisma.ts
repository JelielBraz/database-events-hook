import "./config";
import { PrismaClient } from "@prisma/client";
import { sns } from "./aws";

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  const result = await next(params);

  if (["create", "update", "delete"].includes(params.action)) {
    const message = {
      event: params.action.toUpperCase(),
      model: params.model,
      data: result,
      timestamp: new Date(),
    };

    const topicArn = process.env.SNS_TOPIC_ARN!;

    await sns
      .publish({
        Message: JSON.stringify(message),
        TopicArn: topicArn,
      })
      .promise();

    console.log(`Published to SNS: ${JSON.stringify(message)}`);
  }

  return result;
});

export default prisma;
