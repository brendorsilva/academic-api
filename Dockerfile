# Usando a versão Alpine para uma imagem mais leve (opcional, mas recomendado)
FROM node:22-slim

# Instalar dependências necessárias para o Prisma e PM2
RUN apt-get update && apt-get install -y openssl libssl-dev && \
    npm install -g pm2 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./

# Instala as dependências de produção e desenvolvimento (necessário para o build)
RUN npm install

# Copia a pasta do Prisma e gera o Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o restante do código
COPY . .

# Gera o build de produção
RUN npm run build

# Expõe a porta que você definiu (6900)
EXPOSE 3000

# Script de inicialização: roda as migrations e sobe com PM2
CMD ["sh", "-c", "npx prisma migrate deploy && pm2-runtime dist/src/main.js"]