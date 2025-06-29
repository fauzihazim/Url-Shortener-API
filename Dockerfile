FROM node:22.14.0-alpine

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm install
RUN npx prisma generate
COPY . .

EXPOSE 3000
EXPOSE 3001

CMD ["node", "index.js"]