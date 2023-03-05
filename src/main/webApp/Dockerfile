FROM node:17-alpine3.15
LABEL org.opencontainers.image.source="https://github.com/pr0tex/DynaNotes"
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package-lock.json .
COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
