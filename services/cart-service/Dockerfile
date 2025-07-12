# Base image
FROM node:20-alpine

# Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere package files
COPY package*.json ./
COPY tsconfig.json ./

# Installiere alle dependencies inkl. dev dependencies
RUN npm install

# Kopiere source code
COPY src/ ./src/

# Baue TypeScript
RUN npm run build

# Expose Port 3000
EXPOSE 3000

# Starte die App
CMD ["npm", "start"]
