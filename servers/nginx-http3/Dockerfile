FROM debian:buster-slim

# Versions
ENV PATCH_NGINX_VERSION=1.16
ENV NGINX_VERSION=${PATCH_NGINX_VERSION}.1 \
    QUICHE_REVISION=e45883da9c9d293bfe1d0d8fcd2280d95022b658

RUN apt update && \
    # Install requirements
    apt install -y curl git build-essential cmake golang-go libpcre3 libpcre3-dev zlib1g-dev && \
    # Install Rust
    # NOTE: Rust version is not fixed
    curl https://sh.rustup.rs -sSf | sh -s -- -y && \
    PATH="/root/.cargo/bin:$PATH" && \
    mkdir build && cd build && \
     # Download Nginx
    curl https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar zx && \
    # Get Quiche
    git clone --recursive https://github.com/cloudflare/quiche && \
    cd quiche && \
    git checkout ${QUICHE_REVISION} && \
    cd /build/nginx-${NGINX_VERSION} && \
    # Apply patch to Nginx
    patch -p01 < ../quiche/extras/nginx/nginx-${PATCH_NGINX_VERSION}.patch
   
RUN cd /build/nginx-${NGINX_VERSION} && \
    PATH="/root/.cargo/bin:$PATH" && \
    # Configure
    ./configure                                      \
        --prefix=/etc/nginx                          \
        --sbin-path=/usr/sbin/nginx                  \
        --modules-path=/usr/lib/nginx/modules        \
        --conf-path=/etc/nginx/nginx.conf            \
        --error-log-path=/var/log/nginx/error.log    \
        --http-log-path=/var/log/nginx/access.log    \
        --pid-path=/var/run/nginx.pid                \
        --lock-path=/var/run/nginx.lock              \
        --http-client-body-temp-path=/var/cache/nginx/client_temp   \
        --http-proxy-temp-path=/var/cache/nginx/proxy_temp          \
        --http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp      \
        --http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp          \
        --http-scgi-temp-path=/var/cache/nginx/scgi_temp            \
        --user=nginx                                 \
        --group=nginx                                \
        --with-http_realip_module                   \
        --with-http_addition_module                 \
        --with-http_sub_module                      \
        --with-http_dav_module                      \
        --with-http_flv_module                      \
        --with-http_mp4_module                      \
        --with-http_gunzip_module                   \
        --with-http_gzip_static_module              \
        --with-http_random_index_module             \
        --with-http_secure_link_module              \
        --with-http_stub_status_module              \
        --with-http_auth_request_module             \
        --with-threads                              \
        --with-stream                               \
        --with-stream_ssl_module                    \
        --with-stream_ssl_preread_module            \
        --with-stream_realip_module                 \
        --with-http_slice_module                    \
        --with-compat                               \
        --with-file-aio                             \
        --with-ipv6                                 \
        --with-http_ssl_module                       \
        --with-http_v2_module                        \
        --with-http_v3_module                        \
        --with-openssl=../quiche/deps/boringssl      \
        --with-quiche=../quiche && \
    # Build Nginx
    make && \
    # Install Nginx
    make install

# Cleanup
RUN rm -rf /build && \
    # Remove build requirements
    apt purge -y curl git build-essential cmake golang-go && \
    apt autoclean && apt clean && apt autoremove -y && \
    # Uninstall Rust
    # NOTE: `rustup self uninstall -y` causes 'error: No such file or directory (os error 2)'
    rm -rf $HOME/.cargo $HOME/.rustup && \
    rm -rf /var/lib/apt/lists/*

RUN addgroup --system nginx && \
    adduser --system --home /var/cache/nginx --shell /sbin/nologin --ingroup nginx nginx

CMD ["nginx", "-g", "daemon off;"]

COPY nginx.conf /etc/nginx/nginx.conf

COPY ssl-key.pem /ssl/ssl-key.pem
COPY ssl.pem /ssl/ssl.pem

EXPOSE 80
EXPOSE 443