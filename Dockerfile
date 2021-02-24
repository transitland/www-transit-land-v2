FROM node:12-alpine

RUN mkdir -p /usr/src/nuxt-app
WORKDIR /usr/src/nuxt-app

RUN apk update && apk upgrade && apk add git

COPY . /usr/src/nuxt-app/
RUN yarn install
RUN yarn run build

CMD [ "yarn", "start" ]