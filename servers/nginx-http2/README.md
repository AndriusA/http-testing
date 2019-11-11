A simple Nginx server configuration with HTTP2 enabled.

Gzip compression used as the reasonable default taht should be universally applied.


## SSL Certificate Authority

SSL Files have been generated using mkcert using the following command

```bash
mkcert localhost.dev "*.localhost.dev" localhost 127.0.0.1 ::1
mv localhost.dev+4-key.pem ssl-key.pem
mv localhost.dev+4.pem ssl.pem
# To consider these certificates valid, install the local CA
# mkcert -install
```

## Hosting static content

Build the container:

```bash
docker build . -t brave-experiments/nginx-http2
```

Run it pointing to a directory with the static files:

```bash
docker run -ti -v $CONTENT_DIR:/usr/share/nginx/html -p 80:80 -p 443:443 brave-experiments/nginx-http2
```
