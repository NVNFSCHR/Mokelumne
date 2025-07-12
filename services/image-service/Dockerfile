# Base image
FROM node:20-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Installiere Abhängigkeiten
COPY package*.json ./
RUN npm install

# Kopiere den Quellcode
COPY . .

# Baue TypeScript (falls du tsc verwendest)
RUN npm run build

EXPOSE 4000

# Starte die App
CMD ["npm", "start"]
