FROM node:14-alpine

WORKDIR /var/www

COPY ./booking/package.json ./booking/package-lock.json ./

RUN npm ci

COPY ./booking/ /var/www/
COPY ./proto/ /var/proto/

CMD ["npm", "start"]
