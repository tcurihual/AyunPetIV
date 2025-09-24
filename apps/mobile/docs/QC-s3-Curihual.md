#### Problemas Funcionales

###### Formato: vista || componente - problema - Como replicar problema

-   Vista Login: Permite ingreso a home sin ingresar contraseña - ingresar correo y seleccionar botón Iniciar Sesión
-   Componente navbar: Seleccionar algún botón no redirigue a alguna ruta, solo funciona con el home - seleccionar algún botón
-   Flujo de registro contiene el contenido de los campos anteriores al realizar el register. Ej: ingreso nombre y rut ----- boton siguiente ----> contraseña y verificar contra con los valores de nombre y rut

    -   Actualmente no se esta con datos reales pero lo ideal seria redirigir al Home una vez se crea una cuenta

-   Vista intermedia para la consulta de preferencia de mascotas: No se muestra al abrir la app por primera vez
-   Las alertas no deberian mostrarse a la vez que el Loading, debe existir una jerarquía para mostrar ya sea primero la alerta y luego el loading o viceversa. O desistir de la alerta y mantener solo el loading

#### Problemas de Diseño

###### Formato: vista||componente - problema

-   Problema general: Al seleccionar algún campo en un formulario el teclado suele tapar el campo a rellenar dificultando al usuario el ingreso de datos
-   Componente Back
-   Vista Login: Al seleccionar un campo y luego ir hacia atras (cerrando el teclado), se observa un bloque negro que ocupa bastante espacio
-   Vista Register:
    -   StatusBar debe ser color amarillo
    -   Número de pasos mal centrado
    -   Circulo detras del logo debe alinearse con el sombrero del logo (no usar valores fijos, usar porcentajes)
    -   Placeholder del input Teléfono, se solicita +569, pero solo se debe ingresar solo 9 dígitos, provocando confusión al usuario
-   Layout Header: Color distinto al amarillo principal
-   Solucionar problemas de ortografía:
    -   exclamaciones o preguntas deben ir con ¡!, ¿? (Welcome)
    -   Mayusculas solo en la primera palabra a excepción de nombres propios (Boton Welcome)
-   Flujo de Reestablecer Contraseña: Mal diseño, espaciado muy cercano al header
