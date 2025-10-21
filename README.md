# Proyecto de Grado

Este es el repositorio del proyecto de grado "Transporte Público de Girardot - Backend" desarrollado por el estudiante Juan Andrés Vega Gonzalez.

## Tecnologías Utilizadas

- **PHP 8.4.13**: Lenguaje de programación utilizado para el desarrollo del backend.
- **Composer 2.8.12**: Herramienta de gestión de dependencias para PHP.
- **Laravel 12**: Framework PHP utilizado para el desarrollo del backend.
- **PostgreSQL 17**: Sistema de gestión de bases de datos relacional utilizado para almacenar los datos. Se recomienda instalar la versión 17 para asegurar la compatibilidad.

## Instalación

Dentro este proyecto se incluye una carpeta llamada `theftp` que contiene todo el código fuente del backend. Para instalar y configurar el proyecto, sigue estos pasos:

1. **Copiar el .env.example**: Copia el archivo `.env.example` y renómbralo a `.env`. Este archivo contiene las variables de entorno necesarias para la configuración del proyecto.

   ```bash
   cp .env.example .env
   ```
  
2. **Configurar las Variables de Entorno**: Abre el archivo `.env` y configura las siguientes variables según tu entorno:
    - `DB_CONNECTION`: Tipo de base de datos (debe ser `pgsql` para PostgreSQL).
    - `DB_HOST`: Dirección del servidor de la base de datos (por ejemplo, `127.0.0.1`).
    - `DB_PORT`: Puerto de la base de datos (por defecto es `5432` para PostgreSQL).
    - `DB_DATABASE`: Nombre de la base de datos que has creado para el proyecto.
    - `DB_USERNAME`: Nombre de usuario para acceder a la base de datos.
    - `DB_PASSWORD`: Contraseña del usuario de la base de datos.

3. **Instalar Dependencias**: Navega a la carpeta `theftp` y ejecuta el siguiente comando para instalar las dependencias del proyecto utilizando Composer:
    ```bash
    cd theftp
    composer install
    ```

4. **Generar la Clave de la Aplicación**: Ejecuta el siguiente comando para generar una clave única para la aplicación:
    ```bash
    php artisan key:generate
    ```
  
5. **Ejecutar las Migraciones**: Ejecuta las migraciones para crear las tablas necesarias en la base de datos:
    ```bash
    php artisan migrate
    ```

6. **Ejecutar los Seeders**: Si deseas poblar la base de datos con datos iniciales, ejecuta los seeders:
    ```bash
    php artisan db:seed
    ```

7. **Registrar tareas programadas (Backups)**: Si deseas configurar tareas programadas para realizar copias de seguridad, asegúrate de registrar las tareas en el cron de tu servidor. Puedes hacerlo ejecutando el siguiente comando:
    ```bash
    * * * * * php /ruta/a/tu/proyecto/theftp/artisan schedule:run >> /dev/null 2>&1
    ```

8. **Iniciar el Servidor de Desarrollo**: Finalmente, inicia el servidor de desarrollo con el siguiente comando:
    ```bash
    php artisan serve
    ```
    El servidor estará disponible en `http://localhost:8000`.

## Documentación de la API

La documentación de la API está disponible en el Swagger utilizando L5-Swagger

### Generar Documentación
```
php artisan l5-swagger:generate
```

### Ingresar al swagger
```
http://localhost:8000/api/documentation
```

## Autores
- Juan Andrés Vega Gonzalez - Estudiante de Ingeniería de Sistemas de la Universidad Piloto de Colombia Seccional Del Alto Magdalena
- Juan Sebastian Cetares Laguna - Estudiante de Ingeniería de Sistemas de la Universidad Piloto de Colombia Seccional Del Alto Magdalena

## Agradecimientos

Agradecemos a la Universidad Piloto de Colombia por brindar el apoyo necesario para la realización de este proyecto de grado.