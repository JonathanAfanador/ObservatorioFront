FROM php:8.4-apache

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    libzip-dev \
    zip \
    unzip \
    libpq-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensiones de PHP necesarias
RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    pdo_pgsql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

# Instalar Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Habilitar mod_rewrite de Apache
RUN a2enmod rewrite

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar el código del proyecto al contenedor
COPY . /var/www/html

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Instalar dependencias de PHP
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-dev --optimize-autoloader

# Instalar dependencias de Node y compilar assets
RUN npm install && npm run build

# Ajustar permisos para Laravel
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Cambiar la raíz del documento al directorio public de Laravel
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Exponer el puerto 80
EXPOSE 80

# PARCHE EN TIEMPO DE EJECUCIÓN (CMD): Desactiva módulos duplicados al arrancar el contenedor, migra y enciende Apache
CMD ["/bin/sh", "-c", "a2dismod mpm_event || true && a2dismod mpm_worker || true && a2enmod mpm_prefork || true && php artisan migrate --force && apache2-foreground"]