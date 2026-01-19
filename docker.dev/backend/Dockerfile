# Use the official Node.js image
FROM node:18-alpine 

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install ghostscript
RUN apk add --no-cache ghostscript

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application files
COPY . .

# Expose the port your app runs on
EXPOSE 3000

RUN npx prisma generate

# Command to run your app using nodemon
CMD ["npm", "run", "devstart"]
