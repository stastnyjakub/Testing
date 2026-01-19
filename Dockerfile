FROM node:20-alpine

# Argument and Environment Variable
ARG SENTRY_AUTH_TOKEN
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN

# Set the working directory
WORKDIR /usr/src/qapline

# Add older Alpine repository for libssl1.1 and install it
RUN echo "http://dl-cdn.alpinelinux.org/alpine/v3.16/main" >> /etc/apk/repositories && \
    apk update && \
    apk add --no-cache libssl1.1 --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main

# Install ghostscript
RUN apk add --no-cache ghostscript

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies without caching node_modules
RUN npm install --force

# Copy the rest of the application code
COPY . .

RUN npx prisma generate

# Build the application
RUN npm run build

# Generate source maps for Sentry
RUN npm run sentry:sourcemaps

# Expose the application port
EXPOSE 8080

# Command to run the application
CMD ["node", "dist/server.js", "--trace-warnings"]
