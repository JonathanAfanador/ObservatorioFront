# ── Stage 1: Node.js builder ─────────────────────────────────────────────────
FROM node:20-slim AS node-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --prefer-offline && npm cache clean --force
COPY . .
RUN npm run build

# ── Stage 2: PHP + Apache runtime ────────────────────────────────────────────
FROM php:8.4-apache

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    git curl libpng-dev libonig-dev libxml2-dev \
    libzip-dev zip unzip libpq-dev postgresql-client \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensiones de PHP
RUN docker-php-ext-install \
    pdo pdo_mysql pdo_pgsql mbstring exif pcntl bcmath gd zip

# Habilitar mod_rewrite y headers de Apache
RUN a2enmod rewrite headers  # ← headers es necesario para CORS

WORKDIR /var/www/html
COPY . /var/www/html

# Copiar los assets compilados desde el builder (reemplaza cualquier dist sin compilar)
COPY --from=node-builder /app/public/build /var/www/html/public/build

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf


RUN echo '<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' >> /etc/apache2/apache2.conf

EXPOSE 80


CMD ["/bin/sh", "-c", \
    "a2dismod mpm_event || true && \
    a2dismod mpm_worker || true && \
    a2enmod mpm_prefork || true && \
    php artisan config:clear && \
    php artisan cache:clear && \
    php artisan route:clear && \
    php artisan migrate --force && \
    php artisan schedule:work & \
    apache2-foreground"]
