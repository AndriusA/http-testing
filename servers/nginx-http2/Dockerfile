FROM nginx:1.17.5

COPY nginx.conf /etc/nginx/nginx.conf

COPY ssl-key.pem /ssl/ssl-key.pem
COPY ssl.pem /ssl/ssl.pem

EXPOSE 80
EXPOSE 443