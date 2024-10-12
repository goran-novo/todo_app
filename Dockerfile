FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
COPY .env .env

RUN npm run build

EXPOSE 3000

CMD npm run migration:run && npm run start:prod