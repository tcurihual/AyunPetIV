# Ayün Pet

[![Estado del Build](https://img.shields.io/github/actions/workflow/status/tcurihual/AyunPetIV/CI.yml?branch=develop&style=for-the-badge)](https://github.com/tcurihual/AyunPetIV/actions)
[![Licencia](https://img.shields.io/github/license/tcurihual/AyunPetIV?style=for-the-badge)](./LICENSE.md)
[![Contribuidores](https://img.shields.io/github/contributors/tcurihual/AyunPetIV?style=for-the-badge)](https://github.com/tcurihual/AyunPetIV/graphs/contributors)

Plataforma web y móvil destinada a optimizar y centralizar el proceso de adopción de mascotas en Temuco, Chile.

## Descripción

### El Problema
En Chile, más de **cuatro millones de perros y gatos** se encuentran sin supervisión o abandonados. Los métodos de adopción actuales (redes sociales, boca a boca, jornadas) son ineficientes, informales, carecen de trazabilidad y desorganizados.

Esto genera desconfianza en los adoptantes, desgaste de recursos para fundaciones y rescatistas, y expone a los usuarios a contenido sensible (animales en mal estado).

### Nuestra Solución
**Ayün Pet** es una plataforma centralizada que conecta de manera segura y transparente a fundaciones, rescatistas y particulares con personas interesadas en adoptar.

El proyecto busca facilitar la visibilidad de los animales, reducir la exposición a contenido sensible y ofrecer una herramienta eficiente para la gestión de adopciones, disminuyendo el tiempo que una mascota pasa en un refugio.

## Características Principales

* **Gestión de Perfiles:** Registro e inicio de sesión para distintos roles (Adoptante, Fundación/Rescatista, Administrador).
* **Publicaciones (CRUD):** Las fundaciones y rescatistas validados pueden crear, administrar y eliminar publicaciones de mascotas.
* **Búsqueda y Filtros:** Interfaz móvil amigable para buscar y filtrar mascotas por sus características (tamaño, edad, género, etc.).
* **Sistema de Postulación:** Los usuarios pueden enviar solicitudes de adopción formales a través de un formulario, centralizando la comunicación.
* **Interacción Social:** Los usuarios pueden **guardar** publicaciones de interés y dejar **comentarios** para resolver dudas.
* **Moderación y Seguridad:** Un administrador verifica la validez de las publicaciones y los usuarios pueden reportar contenido inapropiado.
* **Perfiles de Entidades:** Perfiles públicos para las fundaciones y rescatistas, aumentando la transparencia del proceso.
* **Gestión Multimedia:** Un microservicio dedicado maneja la subida de imágenes de forma segura.

## Stack Tecnológico

Este proyecto es un **monorepo** gestionado con `pnpm` y `Turborepo`.

|          Área          |        Tecnología       |                             Descripción                             |
| :--------------------: | :---------------------: | :-----------------------------------------------------------------: |
| **Monorepo**           | `pnpm` + `Turborepo`    | Gestión de workspaces y tareas del proyecto. |
| **Aplicación Móvil**   | `React Native` + `Expo` | Plataforma principal para adoptantes. |
|                        | `React Navigation`      | Sistema de navegación de la app móvil. |
| **Aplicación Web**     | `React` + `Vite`        | Dashboard web para administración y fundaciones. |
| **Backend**            | `Node.js` + `Express`   | Creación de microservicios para la API. |
| **Formularios**        | `React Hook Form`       | Gestión y validación de formularios (Login, Registro, Publicación). |
| **Estado Global**      | `React Context`         | Manejo del estado de autenticación (AuthContext). |
| **Gestión de Archivos**| `Multer`                | Middleware para la carga de imágenes en el backend. |
| **Base de Datos**      | `Supabase` (PostgreSQL) | Backend-as-a-Service y base de datos relacional. |
| **Linting/Formatting** | `ESLint` + `Prettier`   | Consistencia y calidad del código. |

## Instalación y Puesta en Marcha

Sigue estos pasos para levantar el entorno de desarrollo local.

### Prerrequisitos
* Node.js (v18 o superior)
* pnpm (v8 o superior)

### Pasos

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/tcurihual/AyunPetIV.git](https://github.com/tcurihual/AyunPetIV.git)
    cd AyunPetIV
    ```

2.  **Instalar dependencias:**
    `pnpm` instalará todas las dependencias del monorepo y las enlazará automáticamente.
    ```bash
    pnpm install
    ```

3.  **Configurar variables de entorno:**
    Copia el archivo `.env.example` y renómbralo a `.env`. Rellena las variables necesarias (claves de API, conexión a BD, etc.).
    ```bash
    cp .env.example .env
    ```
    *(Nota: Puede ser necesario crear archivos `.env` específicos dentro de cada aplicación en `apps/`)*

4.  **Iniciar todas las aplicaciones (modo desarrollo):**
    Gracias a Turborepo, puedes iniciar todo el stack (móvil, web y api) con un solo comando:
    ```bash
    pnpm dev
    ```

## Equipo y Contribuidores

Este proyecto es desarrollado por estudiantes de Ingeniería Civil en Informática de la Universidad Católica de Temuco.

* **[Tomás Curihual](https://github.com/tcurihual)**
* **[Javier Curipan](https://github.com/JaviCuri)**
* **[Rodrigo Gutierrez](https://github.com/b3divere)**
* **[Carlos Huenuman](https://github.com/HJFlash)**
* **[Camilo Parada](https://github.com/cammmil0)**

¡Las contribuciones son bienvenidas! Por favor, abre un *Pull Request* siguiendo las guías de contribución.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE.md](./LICENSE.md) para más detalles.
