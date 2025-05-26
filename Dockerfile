FROM node:18-alpine AS build

WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

# Use Nginx to serve the static files
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
# For Vite, use: /app/dist instead of /app/build

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
