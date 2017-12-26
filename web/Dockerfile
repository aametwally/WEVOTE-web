FROM node:carbon

## Install NPM Packages
ADD package.json /tmp/package.json
RUN cd /tmp && rm -rf ./node_modules  && npm install
RUN mkdir -p /root/web && cp -r /tmp/node_modules /root/web

## Copy source
WORKDIR /root/web
ADD . /root/web
RUN npm run config && npm run build

EXPOSE 3000

CMD ["npm","start"]
