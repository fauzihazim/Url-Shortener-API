FROM node:22.14.0-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npm install -g Prisma

COPY . .

RUN npx prisma generate

EXPOSE 3000
EXPOSE 3001

CMD ["sh", "-c", "npx prisma migrate reset --force && node index.js"]