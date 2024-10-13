FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
COPY .env .env

COPY src/modules/email/templates ./src/modules/email/templates

RUN npm run build

EXPOSE 3000

CMD npm run migration:run && npm run start:dev