FROM php:8.3-apache

# PHP extensions & Apache modules
RUN docker-php-ext-install pdo pdo_mysql mysqli \
 && a2enmod rewrite headers \
 # Allow .htaccess overrides under /var/www/
 && sed -i 's/AllowOverride None/AllowOverride All/i' /etc/apache2/apache2.conf

# Timezone
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# php.ini
COPY php.ini /usr/local/etc/php/php.ini

# Quiet "ServerName" warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf
