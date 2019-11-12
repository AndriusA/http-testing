# Base Nginx HTTP/3 Image
FROM ranadeeppolavarapu/nginx-http3:latest

# Copy your certs.
COPY ssl-key.pem /ssl/ssl-key.pem
COPY ssl.pem /ssl/ssl.pem

# Copy your configs.
COPY nginx.conf /etc/nginx/
COPY h3.nginx.conf /etc/nginx/conf.d/

EXPOSE 80
EXPOSE 443
EXPOSE 443/udp