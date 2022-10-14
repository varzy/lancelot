FROM node:lts-alpine as builder
WORKDIR /app
COPY package.json ./
COPY yarn.lock ./
RUN yarn
COPY . .
RUN yarn build
CMD ["yarn", "start:prod"]
