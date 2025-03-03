# Use the official Node.js LTS image
FROM node:23-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Build the TypeScript code
RUN npm install -g typescript && tsc

# Expose the port
EXPOSE 3000

# Start the application
CMD ["node", "dist/app.js"]