FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .
COPY src/config/config.prod.json src/config/config.json

EXPOSE 8080

CMD ["npm", "run", "start"]