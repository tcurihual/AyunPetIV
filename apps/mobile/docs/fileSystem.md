### Descripción Estructura Mobile

#### `app/`

Contiene toda la estructura de navegación y las pantallas de la aplicación, gestionada por **Expo Router**.

-   **Contenido**: Archivos `.tsx` que se mapean a rutas. Se usan directorios con paréntesis como `(tabs)` o `(auth)` para crear _layouts_ o grupos de rutas sin afectar la URL.

#### `assets/`

Almacena todos los recursos estáticos.

-   **Contenido**: Subcarpetas como `images`, `fonts`, `animations`, etc.

Dentro del codigo se puede usar `@/animations/`, `@/images/` o `@/fonts/` para evitar tener que poner la ruta completa

#### `components/`

Componentes de React reutilizables en toda la aplicación.

-   **Estructura Sugerida**:
    -   `components/ui/`: Componentes básicos y genéricos sin lógica de negocio (ej: `Button.tsx`, `Input.tsx`, `Card.tsx`).
    -   `components/common/`: Componentes más complejos y específicos que se usan en varias pantallas (ej: `RequestCard.tsx`, `BottomNavbar.tsx`).

Dentro del codigo se puede usar `@/common/` o `@/ui/` para evitar tener que poner la ruta completa

#### `constants/`

Guarda valores constantes que no cambian.

-   **Contenido**: Archivos como `Colors.ts`, `Theme.ts`, `ApiEndpoints.ts`.

#### `contexts/`

Manejo de estado global usando la API de Context de React.

-   **Contenido**: Cada archivo define un proveedor de contexto (ej: `AuthContext.tsx`, `RequestContext.tsx`).

#### `features/`

Agrupar lógica de negocio específica de una funcionalidad que no es ni un componente, ni un hook, ni una pantalla.

-   **Contenido**: Lógica compleja relacionada con `givers`, `comments`, etc.

#### `hooks/`

Almacenar hooks personalizados de React para reutilizar lógica con estado o efectos.

-   **Contenido**: Archivos como `useAuthentication.ts` o `useFetchRequests.ts`.

#### `services/`

Centralizar toda la comunicación con servicios externos, principalmente la API backend.

-   **Contenido**: Funciones para realizar peticiones HTTP (GET, POST, etc.). Por ejemplo, `requestService.ts`.

#### `utils/`

Funciones de ayuda puras y genéricas que no dependen del estado de la aplicación, también contiene interfaces y tipos de TypeScript para mantener un tipado consistente.

-   **Contenido**: Funciones para formatear fechas, validar strings, etc. (ej: `dateFormatter.ts`).
