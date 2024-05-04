# Use the official Nginx image from Docker Hub
FROM nginx

# Copy your custom Nginx configuration file to the container
COPY nginx.conf /etc/nginx/conf.d/nginx.conf

# Expose port 8080 to the outside world
EXPOSE 8080


# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
