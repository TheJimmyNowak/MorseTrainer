# build app
FROM node:18-alpine AS build
WORKDIR /usr/src/morsetrainer
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Serve built files
FROM nginx:alpine
COPY --from=build /usr/src/morsetrainer/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]