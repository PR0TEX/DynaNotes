FROM node:17-alpine3.15
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json package-lock.json .

RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
