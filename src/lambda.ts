import "./config";
import { SQSEvent, SQSHandler, APIGatewayEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
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

      parsedMessage.data = JSON.parse(parsedMessage.data);

      const model: Model = {
        index: parsedMessage.model,
        id: parsedMessage.data?.id,
        data: parsedMessage.data,
      };

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

export const apiGatewayHandler: APIGatewayProxyHandler = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  console.log("Logouu!");
  console.log(event);
  console.log('----------');
  console.log(event.body);
  console.log('----------');
  console.log(event.queryStringParameters);
  console.log('----------');
  console.log(event.pathParameters);

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

  let searchAttributes = {
    index: "payment",
    body: {
      query: {
        match_all: {}
      },
      size: 20
      
    }
  };

  const response = await openSearchClient.search(searchAttributes);

  return {
    statusCode: 200,
    body: JSON.stringify(response)
  };
} 
