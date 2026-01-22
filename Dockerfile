FROM php:8.2-apache

# Apache modules
RUN a2enmod ssl rewrite

# PHP extensions
RUN docker-php-ext-install pdo pdo_mysql

# SSL dir
RUN mkdir -p /etc/apache2/ssl

# self-signed cert（IP用）
RUN openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout /etc/apache2/ssl/server.key \
  -out /etc/apache2/ssl/server.crt \
  -subj "/CN=10.96.22.128"

# SSL config
COPY apache/default-ssl.conf /etc/apache2/sites-available/default-ssl.conf
RUN a2ensite default-ssl
