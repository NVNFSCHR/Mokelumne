FROM ubuntu:latest
LABEL authors="navinfischer"

ENTRYPOINT ["top", "-b"]

# Base image
FROM node:20

# Arbeitsverzeichnis im Container
WORKDIR /app

# Installiere Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopiere den Quellcode
COPY . .

# Baue TypeScript (falls du tsc verwendest)
RUN npm run build

# Starte die App
CMD ["npm", "start"]
