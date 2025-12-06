# Step 1: Build the React app
FROM node:16 as build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Build the app for production
RUN npm run build

# Step 2: Serve the React app using Nginx
FROM nginx:alpine

# Copy the build files from the build stage to Nginx's html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 (Nginx's default port)
EXPOSE 80

# Command to run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
