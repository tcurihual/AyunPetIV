# Uso del Mock de Datos en la App Móvil

Este documento explica cómo utilizar el archivo `mockData.ts` dentro de la aplicación móvil del proyecto **Ayün Pet**.  
El objetivo es simular la base de datos mientras el backend aún no está disponible, de modo que podamos **desarrollar pantallas, probar flujos y validar UI/UX**.

---

## 1) Estructura del mock (`mockData.ts`)

El mock contiene varias colecciones principales que representan las tablas del sistema real:

- **role** → Tipos de rol (ej: fundación, adoptante).
- **users** → Adoptantes y fundaciones con sus datos de identificación.
- **pet** → Mascotas con información básica (nombre, especie, edad, tamaño, estado, etc.).
- **post** → Publicaciones que relacionan un usuario con una mascota.
- **adoption_request** → Solicitudes de adopción hechas por los adoptantes.
- **adoption_history, message, report** → Estructuras adicionales para pruebas de otras funciones.

Ejemplo reducido en TypeScript:

```typescript
export default {
  role: [{ id: 1, roletype: "fundacion" }],
  users: [
    { id: 1, role: 1, email: "contacto@patitasfelices.cl", name: "Fundación Patitas Felices" },
  ],
  pet: [
    {
      id: 101,
      ownerid: 1,
      species: "Perro",
      name: "Firulais",
      gender: "Macho",
      age: 3,
      size: "Mediano",
      sterilized: false,
      adopted: false,
      image: require("@/assets/images/perro1.jpg"),
      description: "Muy juguetón y cariñoso",
    },
  ],
  post: [{ id: 201, creatorid: 1, petid: 101, title: "Firulais en adopción", status: "active" }],
  adoption_request: [],
}
```
## 2) Cómo importarlo en la app

En cualquier archivo de React Native puedes importar el mock así:
```typescript
import ayunData from "@/data/mockData";
```
## 3) Ejemplos de uso

- Listar mascotas disponibles (no adoptadas):
```typescript
const disponibles = ayunData.pet.filter(p => !p.adopted);
```

- Obtener publicaciones activas:
```typescript
const postsActivos = ayunData.post.filter(p => p.status === "active");
```

- Resolver el nombre del publicador de una mascota:
```typescript
const getPublisherName = (ownerid: number) =>
  ayunData.users.find(u => u.id === ownerid)?.name ?? "Fundación Demo";
  ```