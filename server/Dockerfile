FROM node:14

WORKDIR /usr/src/app
COPY package*.json ./
RUN yarn install && yarn cache clean

COPY . .
EXPOSE 3000
CMD ["node", "app.js"]