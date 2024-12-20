# #!/bin/bash

# Carregar variáveis de ambiente do arquivo .env
. "$(dirname "$0")/.env"

# Remove the /dist directory and /src/lambda.zip file if they exist
rm -rf dist
rm -f src/lambda.zip

# Create SNS topic
TOPIC_ARN=$(awslocal sns create-topic --name prisma-events --query 'TopicArn' --output text)
echo "Created SNS topic with ARN: $TOPIC_ARN"

# Create SQS queue
QUEUE_URL=$(awslocal sqs create-queue --queue-name MyQueue --query 'QueueUrl' --output text)
echo "Created SQS queue with URL: $QUEUE_URL"

# Get SQS queue ARN
QUEUE_ARN=$(awslocal sqs get-queue-attributes --queue-url $QUEUE_URL --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)
echo "SQS queue ARN: $QUEUE_ARN"

# Subscribe SQS queue to SNS topic
awslocal sns subscribe --topic-arn $TOPIC_ARN --protocol sqs --notification-endpoint $QUEUE_ARN
echo "Subscribed SQS queue to SNS topic"

# Build the Lambda function
npm run build

# Create Lambda zip file without including the directory structure
zip -j src/lambda.zip dist/lambda.js

# Create Lambda function
awslocal lambda create-function --function-name sqsConsumer \
  --runtime nodejs14.x \
  --handler lambda.handler \
  --zip-file fileb://src/lambda.zip \
  --role arn:aws:iam::000000000000:role/lambda-role \
  --environment Variables="{SNS_TOPIC_ARN=$TOPIC_ARN, SQS_QUEUE_URL=$QUEUE_URL, DATABASE_URL=$DATABASE_URL, OPENSEARCH_NODE=$OPENSEARCH_NODE, AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY}"

# Create event source mapping
awslocal lambda create-event-source-mapping \
  --function-name sqsConsumer \
  --batch-size 10 \
  --event-source-arn $QUEUE_ARN