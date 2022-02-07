FROM node:14-alpine

WORKDIR /var/www

RUN apk add --no-cache --virtual python make g++

RUN apk add --no-cache --virtual .gyp

COPY package.json package-lock.json ./

RUN npm ci

RUN apk del .gyp

COPY . /var/www/

CMD ["npm", "start"]
