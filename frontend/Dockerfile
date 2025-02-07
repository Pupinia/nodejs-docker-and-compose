FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . . 
RUN npm run build
RUN rm -rf ./src
RUN rm -rf ./node_modules

FROM nginx:latest AS production
WORKDIR /app
COPY --from=build /app/build /usr/share/nginx/html/
COPY ./nginx/conf.d/default.conf /etc/nginx/conf.d/
EXPOSE 80