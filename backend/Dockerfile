FROM node:16-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . . 
RUN npm run build
RUN rm -rf ./src
RUN rm -rf ./node_modules

FROM node:16-alpine AS production
WORKDIR /app
RUN npm install -g pm2
COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist/
COPY ./ecosystem.config.js ./

CMD ["pm2-runtime", "ecosystem.config.js"]