# Uso del JSON de Pruebas en la App Móvil

Este documento explica cómo utilizar el archivo `mockData.json` dentro de la aplicación móvil del proyecto **Ayün Pet**.  
El objetivo es simular la base de datos mientras el backend aún no está disponible, de modo que podamos **desarrollar pantallas, probar flujos y validar UI/UX**.

---

## 1) Estructura del JSON (mockData.json)

El JSON contiene cuatro colecciones principales:

- **usuarios** → Adoptantes, fundaciones o administradores.
- **mascotas** → Animales con datos básicos (nombre, edad, estado, etc.).
- **publicaciones** → Relación entre un usuario que publica y una mascota.
- **solicitudes** → Postulaciones hechas por adoptantes para adoptar una mascota.

Ejemplo reducido:

```json
{
  "usuarios": [{ "id": 1, "nombre": "Fundación Patitas Felices", "rol": "fundacion" }],
  "mascotas": [{ "id": 101, "nombre": "Firulais", "estado": "disponible" }],
  "publicaciones": [{ "id": 201, "mascotaId": 101, "usuarioId": 1 }],
  "solicitudes": [{ "id": 301, "mascotaId": 101, "solicitanteId": 2, "estado": "pendiente" }]
}
```
## 2) Cómo importarlo en la app

En cualquier archivo de React Native puedes importar el mock así:
```typescript

import mockData from "../../docs/mockData.json"; 

```
(la ruta de importacion varia segun donde estes trabajando)

Ahora puedes usarlo como una “base de datos local”. Ejemplo:

```typescript
// Listado de mascotas disponibles
const mascotasDisponibles = mockData.mascotas.filter(m => m.estado === "disponible");
```
