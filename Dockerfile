# Stap 1: Bouwen van de app
FROM node:18-alpine AS builder

# Werkdirectory instellen
WORKDIR /app

ARG STAGE
ENV STAGE=$STAGE

# Dependencies installeren en build uitvoeren
COPY package*.json ./
COPY $STAGE.env ./.env
RUN npm install
COPY . .
RUN npm run build

# Stap 2: Nginx gebruiken om de statische bestanden te serveren
FROM nginx:alpine

ARG PORT
ENV PORT=$PORT
ARG STAGE
ENV STAGE=$STAGE

# Kopieer de statische bestanden van de build naar de Nginx public directory
RUN mkdir -p /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html
COPY /conf/nginx /etc/nginx
RUN rm /etc/nginx/conf.d/*.default.conf
COPY /conf/nginx/conf.d/$STAGE.default.conf /etc/nginx/conf.d/default.conf

# Expose port 3030 or 3035
EXPOSE $PORT

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
