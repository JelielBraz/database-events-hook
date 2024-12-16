# #!/bin/bash

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