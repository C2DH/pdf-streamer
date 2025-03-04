# Use the official Node.js LTS image
FROM node:23-slim AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (both production & development)
RUN npm ci 

# Copy the source code
COPY src ./src
COPY tsconfig.json ./
COPY LICENSE ./

# Build TypeScript code
RUN npm run build
# Remove dev dependencies to keep the image light
RUN npm ci --omit=dev
# Final Runtime Image (Smaller & Secure)
FROM node:23-slim

# Set working directory
WORKDIR /usr/src/app

# Copy built files from build stage
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package.json ./

ARG PDF_BASE_DIR=./data
ARG BASE_URL=http://localhost:3000
ARG BUILD_DATE
ARG COMMIT_HASH
ARG VERSION

# Expose application port
EXPOSE 3000

# Define environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV PDF_BASE_DIR=$PDF_BASE_DIR
ENV BASE_URL=$BASE_URL
ENV BUILD_DATE=$BUILD_DATE
ENV COMMIT_HASH=$COMMIT_HASH
ENV VERSION=$VERSION
# Start the application
CMD ["node", "dist/app.js"]
