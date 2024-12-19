import "./config";
import { SQSEvent, SQSHandler } from "aws-lambda";
import { Client } from "@opensearch-project/opensearch/.";
import { AwsSigv4Signer } from "@opensearch-project/opensearch/aws";
import { fromEnv } from "@aws-sdk/credential-providers";
import { sqs } from "./aws";

interface Model {
  index: string;
  id: number;
  data: any;
}

export const handler: SQSHandler = async (event: SQSEvent) => {
  console.log("SQS_QUEUE_URL:", process.env.SQS_QUEUE_URL);

  console.log("Iniciando for");
  for (const record of event.Records) {
    try {
      console.log("Iniciando processamento de record:", record);
      const { body, receiptHandle } = record;
      const message = JSON.parse(body).Message;
      const parsedMessage = JSON.parse(message);

      console.log(`Mensagem recebida: ??${parsedMessage}??`);

      console.log("Iniciando conexão com o OpenSearch");
      const openSearchClient = new Client({
        ...AwsSigv4Signer({
          region: "sa-east-1",
          getCredentials: fromEnv(), // Obtém as credenciais do ambiente
        }),
        node: process.env.OPENSEARCH_NODE!,
      });

      console.log("Conexão com o OpenSearch estabelecida");
      console.log("Indexando dados no OpenSearch");
      const model: Model = {
        index: parsedMessage.model,
        id: parsedMessage.data?.id,
        data: parsedMessage.data,
      };

      console.log(`Modelo a ser indexado: ??${model.index}??`);
      await openSearchClient.index({
        index: model.index,
        id: model.id?.toString(),
        body: model.data,
      });

      console.log("Dados indexados no OpenSearch:", model);

      // await sqs
      //   .deleteMessage({
      //     QueueUrl: process.env.SQS_QUEUE_URL!,
      //     ReceiptHandle: record.receiptHandle,
      //   })
      //   .promise();

      // console.log("Deleted message from SQS:", receiptHandle);
    } catch (error) {
      console.error("Error processing record:", record);
      console.error("Error details:", error);
    }
  }
};
