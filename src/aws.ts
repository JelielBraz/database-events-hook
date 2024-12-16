import "./config";
import AWS from "aws-sdk";

AWS.config.update({
  region: "sa-east-1",
  accessKeyId: "test",
  secretAccessKey: "test",
});

const endpoint = "http://localhost:4566";
export const sns = new AWS.SNS({ endpoint });
export const sqs = new AWS.SQS({ endpoint });
