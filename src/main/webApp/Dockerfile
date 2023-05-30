# build environment
FROM node:19-alpine AS build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
COPY .env ./
RUN npm ci --ignore-scripts
RUN npm install react-scripts@3.4.1 -g
COPY public ./public
COPY src ./src
COPY tsconfig.json ./
COPY tsconfig.test.json ./
RUN npm run build

# production environment
FROM nginx:stable-alpine
LABEL org.opencontainers.image.source="https://github.com/pr0tex/DynaNotes"
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
