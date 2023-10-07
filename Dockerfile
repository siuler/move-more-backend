FROM --platform=linux/amd64 node:18

WORKDIR /usr/src/app

COPY ./dist .

EXPOSE 8080

CMD ["node", "index.js"]