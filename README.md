## Pré-requisitos

- Docker e Docker Compose
- Node.js e npm

## Configuração

1. Clone o repositório e navegue até o diretório do projeto.
2. Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

   ```

   DATABASE_URL="mysql://root:root@localhost:3307/mydb?schema=public"
   SNS_TOPIC_ARN="arn:aws:sns:sa-east-1:637423252997:prisma-events"
   SQS_QUEUE_URL="http://localhost:4566/637423252997/MyQueue"

   ```

Altere conforme necessário, o script do passo 4 tem essas infos como output

3. Execute o Docker Compose para iniciar os serviços MySQL e LocalStack:

   ```

   docker-compose up -d

   ```

4. Execute o script de configuração do LocalStack:

   ```

   ./setup-localstack.sh

   ```

5. Instale as dependências do projeto:

   ```

   npm install

   ```

6. Gere o cliente Prisma:

   ```

   npx prisma generate

   ```

7. Execute as migrações do Prisma:

   ```

   npx prisma migrate dev

   ```

## Scripts Disponíveis

- `npm run consumer`: Inicia o consumidor que lê mensagens da fila SQS.
- `npm run producer`: Gera eventos de criação, atualização e exclusão no banco de dados.

## Arquivos Principais

- `src/aws.ts`: Configuração do AWS SDK para SNS e SQS.
- `src/config.ts`: Carrega variáveis de ambiente usando dotenv.
- `src/consumer.ts`: Consome mensagens da fila SQS.
- `src/prisma.ts`: Configura o Prisma Client e publica eventos no SNS.
- `src/producer.ts`: Gera eventos de exemplo no banco de dados.

## Tecnologias Utilizadas

- AWS SDK
- LocalStack
- TypeScript
- Node.js
- Prisma
- Docker
- MySQL
- dotenv
