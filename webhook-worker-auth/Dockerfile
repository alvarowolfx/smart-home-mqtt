FROM node:dubnium-alpine

RUN apk add --no-cache --virtual deps \
  python \
  build-base

COPY ./ /home/node/app

WORKDIR /home/node/app

RUN npm install

RUN apk del deps

CMD ["npm", "start"]