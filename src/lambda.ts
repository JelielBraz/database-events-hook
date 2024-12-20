import "./config";
import { SQSEvent, SQSHandler } from "aws-lambda";
import { Client } from "@opensearch-project/opensearch";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/lib/aws";
import { ResponseError } from "@opensearch-project/opensearch/lib/errors";

interface Model {
  index: string;
  id: number;
  data: any;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    try {
      const { body, receiptHandle } = record;
      const message = JSON.parse(body).Message;
      const parsedMessage = JSON.parse(message);

      const openSearchClient = new Client({
        ...AwsSigv4Signer({
          region: "sa-east-1",
          getCredentials: async () => ({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
          }),
        }),
        node: process.env.OPENSEARCH_NODE!,
      });

      const model: Model = {
        index: parsedMessage.model,
        id: parsedMessage.data?.id,
        data: parsedMessage.data,
      };

      console.log(`Modelo a ser indexado: ${model.index}`);
      console.log(`ID do modelo a ser indexado: ${model.id}`);

      await openSearchClient.index({
        index: model.index,
        id: model.id?.toString(),
        body: model.data,
      });

      console.log("Dados indexados no OpenSearch:", model);
    } catch (error) {
      if (error instanceof ResponseError) {
        console.error("ResponseError details:", error.meta.body);
        return;
      }

      console.error("Error processing record:", record);
      console.error("Error details:", error);
    }
  }
};
