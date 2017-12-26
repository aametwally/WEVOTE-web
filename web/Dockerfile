FROM mhart/alpine-node:latest

RUN apk add --no-cache --virtual .build-deps git

## Install NPM Packages
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /root/web && cp -a /tmp/node_modules /root/web

## Copy source
WORKDIR /root/web
ADD . /root/web
RUN npm run config && npm run build

EXPOSE 3000

CMD ["npm","start"]
