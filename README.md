<p align="center">
  <strong>🌍 Idiomas disponibles / Available Languages:</strong><br>
  <a href="README.md">🇪🇸 Español</a> |
  <a href="README.en.md">🇺🇸 English</a>
</p>

<p align="center">
  <img src="https://visitor-badge.laobi.icu/badge?page_id=tcurihual.AyunPet&left_color=black&right_color=blue&style=for-the-badge" alt="Visitas" />
  <img src="https://img.shields.io/github/stars/tcurihual/AyunPet?style=for-the-badge&logo=github"
       alt="GitHub Stars" />
  <img src="https://img.shields.io/github/forks/tcurihual/AyunPet?style=for-the-badge&logo=github"
       alt="GitHub Forks" />
  <img src="https://img.shields.io/github/issues/tcurihual/AyunPet?style=for-the-badge"
       alt="GitHub Issues" />
  <img src="https://img.shields.io/github/last-commit/tcurihual/AyunPet?style=for-the-badge"
       alt="Último commit" />
  <img src="https://img.shields.io/badge/Licencia-MIT-green?style=for-the-badge"
       alt="Licencia" />
</p>

# 🐾 AyudPet 🐾

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En_Desarrollo-orange?style=for-the-badge" alt="Estado del Proyecto">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

[![Logo de AyudPet](https://github.com/HectorLep/prueba-del-readme/raw/main/assets/logo.png)](https://github.com/HectorLep/prueba-del-readme/raw/main/assets/logo.png)
> Una plataforma web y aplicación móvil para centralizar y agilizar el proceso de adopción de mascotas.

---

## 📋 Tabla de Contenidos

- [📝 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características Principales](#-características-principales)
- [🛠️ Tecnologías Utilizadas](#️-tecnologías-utilizadas)
- [🚀 Cómo Empezar (Guía Rápida para Windows)](#-cómo-empezar-guía-rápida-para-windows)
- [🤝 Cómo Contribuir](#-cómo-contribuir)
- [🆘 Soporte](#-soporte)
- [📜 Licencia](#-licencia)
- [👤 Autores](#-autores)

---

## 📝 Descripción del Proyecto

**AyudPet** es una solución integral que incluye una plataforma web y una aplicación móvil, desarrollada para la asignatura `Taller de Integración II y IV` en la `Universidad Católica de Temuco`.

El proyecto busca optimizar el proceso de adopción de mascotas, conectando de forma eficiente a fundaciones y rescatistas con potenciales adoptantes. A través de nuestras plataformas, ofrecemos herramientas centralizadas para la gestión de animales, estandarizando la información y mejorando la visibilidad para aumentar la tasa de adopciones responsables.

---

## ✨ Características Principales

### 🏢 Para Fundaciones y Rescatistas
**Herramientas centralizadas para una gestión eficiente.**
- ✅ **Publicación Sencilla:** Crea y administra perfiles de mascotas con toda la información necesaria.
- ✅ **Gestión de Estado en Tiempo Real:** Actualiza si una mascota está "disponible", "en proceso" o ya fue "adoptada".

### 🔍 Para Futuros Adoptantes
**Encuentra a tu compañero ideal de forma segura e informada.**
- ✅ **Búsqueda y Filtros Avanzados:** Filtra por especie, tamaño, edad y más para encontrar la mascota perfecta.
- ✅ **Postulación Segura:** Envía solicitudes de adopción a través de un formulario estandarizado.
- ✅ **Lista de Favoritos:** Guarda los perfiles que te interesan para no perderles la pista.

### 🛡️ Para Administradores
**Un entorno seguro y bien moderado para todos.**
- ✅ **Panel de Control:** Gestiona usuarios y contenido reportado.
- ✅ **Moderación de Contenido:** Asegura que todas las publicaciones cumplan con las normas de la comunidad.

---

## 🛠️ Tecnologías Utilizadas

* **Backend:** `Node.js` + `Express` + `TypeScript`
    * **Node.js:** Entorno para ejecutar JavaScript en el servidor.
    * **Express:** Framework para construir la API del backend.
    * **TypeScript:** Lenguaje con tipado estático para un código más robusto.

* **Frontend Web:** `Vite` + `React` + `TypeScript`
    * **React:** Librería para construir interfaces de usuario interactivas.
    * **Vite:** Herramienta de desarrollo rápida para construir y servir el proyecto.
    * **TypeScript:** Lenguaje con tipado estático para el desarrollo frontend.

* **Base de Datos:** `Supabase`
    * Plataforma que provee una base de datos relacional (PostgreSQL), autenticación y APIs auto-generadas.

* **Aplicación Móvil:** `Expo` + `React Native`
    * **React Native:** Framework para crear aplicaciones móviles nativas usando React.
    * **Expo:** Plataforma y herramientas que simplifican el desarrollo y la compilación de apps en React Native.

---

## 🚀 Cómo Empezar (Guía Rápida para Windows)

### Prerrequisitos

Asegúrate de tener instalado el siguiente software:
* [**Git**](https://git-scm.com/downloads)
* [**Node.js v22 LTS**](https://nodejs.org/en/download)
* [**Nginx**](https://nginx.org/download/nginx-1.28.0.zip)
* **pnpm:** (instalar desde PowerShell con `Invoke-WebRequest "https://get.pnpm.io/install.ps1" -UseBasicParsing | Invoke-Expression`)

### Instalación y Ejecución

1.  **Clonar el Repositorio:**
    ````bash
    git clone [https://github.com/tcurihual/AyunPet.git](https://github.com/tcurihual/AyunPet.git)
    cd AyunPet
    ````

2.  **Configurar y Ejecutar Nginx:**
    * Copia el contenido del archivo `nginx.conf` de este repositorio al archivo `conf/nginx.conf` de tu instalación de Nginx.
    * Desde la carpeta de Nginx, ejecuta en la terminal: `start nginx` y luego `nginx -s reload`.

3.  **Configurar el Entorno:**
    * Crea una copia del archivo `.env.example`, renómbrala a `.env` y añade tus claves (ej: Supabase).

4.  **Instalar Dependencias:**
    * En la raíz del proyecto, ejecuta el siguiente comando:
    ````bash
    pnpm install
    ````

5.  **Iniciar el Entorno de Desarrollo:**
    * Este único comando levantará el backend y el frontend web:
    ````bash
    pnpm run dev:web
    ````

La terminal te mostrará la URL donde la aplicación estará corriendo.
---

## 🤝 Cómo Contribuir

¡Las contribuciones son bienvenidas! Este es un proyecto universitario y colaborativo. Si quieres ayudar, por favor sigue estos pasos:
1.  Busca un `issue` abierto en la pestaña [Issues](https://github.com/tcurihual/AyunPet/issues) o propón una nueva mejora.
2.  Para cambios importantes, por favor abre un `issue` primero para discutir lo que te gustaría cambiar.
3.  Asegúrate de seguir las guías de estilo y los estándares del proyecto.

---

## 🆘 Soporte

Si encuentras un problema o tienes una sugerencia, por favor, utiliza los canales oficiales del repositorio:

- **🐛 Reportar un Bug:** Abre un nuevo `Issue` [aquí](https://github.com/tcurihual/AyunPet/issues/new). Por favor, sé lo más detallado posible.
- **💡 Sugerir una Mejora:** Inicia una `Discussion` [aquí](https://github.com/tcurihual/AyunPet/discussions) para proponer nuevas ideas o funcionalidades.

---

## 📜 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 👤 Autores

* **Miguel Fernández** - [@kurovoxx](https://github.com/kurovoxx)
* **Héctor Lepio** - [@HectorLep](https://github.com/HectorLep)
* **Agustin Verga** - [@sonickiller39](https://github.com/sonickiller39)
* **Christopher Solis** - [@Insert-name-115](https://github.com/Insert-name-115)
* **Maximiliano Sáez** - [@Mxtsi7](https://github.com/Mxtsi7)
* **Benjamin Rojas** - [@pvcdf](https://github.com/pvcdf)
* **Diego Ortiz**
* **Sebastian Mena**