FROM node:carbon

## Install NPM Packages
RUN mkdir -p /root/web
WORKDIR /root/web
COPY package.json /root/web
RUN npm install

## Copy source
COPY . /root/web
RUN npm run config && npm run build

EXPOSE 3000
CMD ["npm","start"]
