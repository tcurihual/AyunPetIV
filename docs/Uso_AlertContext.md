# Uso de AlertContext y Alert

Este contexto permite mostrar alertas globales en tu aplicación React Native.

## 1. Mostrar una alerta desde cualquier componente

Utiliza el hook `useAlert` para acceder a las funciones del contexto, como por ejemplo:

```tsx
import { useAlert } from "@/context/AlertContext"

const MiComponente = () => {
    const { showAlert } = useAlert() //necesario

    const handleClick = () => {
        showAlert("¡Operación exitosa!", "success") //necesario
    }

    return <Button title="Mostrar alerta" onPress={handleClick} />
}
```

## 2. Personalización

-   El mensaje y el tipo de alerta (`success`, `error`, `info`, `warning`) se pasan como argumentos a `showAlert`.
-   La alerta se oculta automáticamente después de 10 segundos, pero puedes ocultarla manualmente usando `hideAlert`.

## 3. Visualización

El componente `<Alert />` debe estar presente en tu árbol de componentes para mostrar la alerta visualmente.

---

## 4. Si no funciona en primer lugar revisar lo siguiente

En apps/\_layout.tsx el AlertProvider debe de estar correctamente colocado como se puede ver en el ejemplo.

```tsx
import { AlertProvider } from "@/context/AlertContext"

export default function App() {
    return (
        <AlertProvider>
            {/* Otros componentes */}
            <Alert />
        </AlertProvider>
    )
}
```

**Resumen:**  
Usa `useAlert` para mostrar alertas, y coloca `<Alert />` donde quieras que se visualicen. Recuerden utilizarlo adecuadamente . En **auth/login.tsx** ya está presente.
