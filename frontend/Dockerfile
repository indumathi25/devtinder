# Stage 1: Build the React App
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# Copy custom nginx config if we create one later. For now default is okay-ish but SPA needs config.
# Let's write a simple inline config or just rely on trying.
# Proper SPA routing requires specific Nginx config.

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
