# Reporte de Sesión de QA – Proyecto Ayün Pet

## Problemas encontrados

### Problema 1: Pantalla negra al borrar cuenta con modo oscuro activado
**Rol del usuario:** Adoptante (usuario normal)

**Descripción:**  
Al activar el modo oscuro y luego acceder al apartado de **Configuración → Borrar cuenta**, el sistema elimina correctamente la cuenta y desloguea al usuario, pero posteriormente la aplicación muestra una **pantalla negra** en la cual no es posible volver atrás ni realizar ninguna acción.

**Pasos para reproducir:**
1. Iniciar sesión como usuario normal.  
2. Activar el modo oscuro desde la configuración o el encabezado.  
3. Entrar al perfil o configuración del usuario.  
4. Seleccionar la opción **“Borrar cuenta”**.  

**Resultado actual:**  
La cuenta se borra, el usuario se desloguea, pero se muestra una pantalla negra sin posibilidad de navegación (requiere cerrar completamente la aplicación).

**Resultado esperado:**  
Después de eliminar la cuenta, el sistema debería redirigir automáticamente al **inicio o pantalla de bienvenida**, sin quedarse bloqueado en negro.


### Problema 2: Inputs invisibles en segunda pantalla del registro de usuario
**Rol del usuario:** Adoptante (usuario normal)

**Descripción:**  
Durante el proceso de registro, luego de completar la primera pantalla y avanzar a la segunda (de un total de cuatro), la sección destinada al ingreso de contraseñas no muestra los **inputs** correspondientes. Visualmente no se ven los campos donde deberían escribirse las contraseñas, impidiendo continuar correctamente el registro.

**Pasos para reproducir:**
1. Ingresar al flujo de registro como usuario normal.  
2. Completar la primera pantalla del formulario.  
3. Avanzar a la segunda pantalla (contraseñas).  

**Resultado actual:**  
Los campos para ingresar la contraseña y la confirmación no se muestran en pantalla.

**Resultado esperado:**  
Deberían visualizarse los dos campos de texto para escribir y confirmar la contraseña, permitiendo avanzar al siguiente paso del registro.

### Problema 3: Pantalla de login recuerda usuario incorrecto tras borrar cuenta
**Rol del usuario:** Adoptante (usuario normal)

**Descripción:**  
Al iniciar sesión como usuario normal, existe la opción de **cerrar sesión**, la cual funciona correctamente y redirige al login con el usuario recordado (solo solicita la contraseña).  
Sin embargo, cuando el usuario elige **borrar su cuenta**, el sistema lo redirige también a esta pantalla de “usuario recordado”, pero en ocasiones muestra el **nombre de otro usuario distinto** (aparentemente tomado desde la base de datos), lo cual no debería ocurrir.

**Pasos para reproducir:**
1. Iniciar sesión como usuario normal.  
2. Acceder al perfil o configuración.  
3. Seleccionar la opción **“Borrar cuenta”**.  
4. Observar la pantalla a la que redirige el sistema.  

**Resultado actual:**  
Después de eliminar la cuenta, el sistema muestra la pantalla de login recordado, y a veces aparece el nombre de otro usuario diferente.

**Resultado esperado:**  
Tras borrar la cuenta, el sistema debería redirigir directamente al **login normal** (donde se piden correo y contraseña), sin mostrar usuarios recordados ni datos de otros registros.

### Problema 4: Posibilidad de modificar el correo validado desde el perfil
**Rol del usuario:** Todos (adoptante, refugio y administrador)

**Descripción:**  
Desde el apartado de perfil, al seleccionar la opción **“Editar perfil”**, el sistema permite modificar el campo de **correo electrónico**.  
Esto ocurre con cualquier tipo de usuario (normal, shelter o administrador).  
Sin embargo, el correo es un dato utilizado para la validación de cuenta, por lo que permitir su modificación directa puede causar inconsistencias en la verificación y autenticación del usuario.

**Pasos para reproducir:**
1. Iniciar sesión con cualquier tipo de usuario (normal, refugio o administrador).  
2. Acceder al perfil del usuario.  
3. Seleccionar **“Editar perfil”**.  
4. Verificar que el campo de correo electrónico es editable.

**Resultado actual:**  
El campo de correo electrónico se puede modificar libremente sin requerir nueva validación.

**Resultado esperado:**  
El correo electrónico validado no debería poder modificarse directamente desde el perfil, o bien debería solicitar una **revalidación** mediante envío de código al nuevo correo antes de aplicar el cambio.

### Problema 5: Pantalla en blanco al eliminar una solicitud de adopción
**Rol del usuario:** Adoptante (usuario normal)

**Descripción:**  
El usuario puede acceder a la pantalla de **solicitudes enviadas** para editar o eliminar una solicitud de adopción.  
Al eliminar una solicitud, el sistema muestra correctamente el mensaje de confirmación indicando que la solicitud fue eliminada con éxito.  
Sin embargo, después de esto, la aplicación muestra una **pantalla en blanco**, desde la cual solo es posible salir presionando el botón de retroceso.

**Pasos para reproducir:**
1. Iniciar sesión como usuario normal.  
2. Enviar una solicitud de adopción a una mascota.  
3. Acceder a la vista de **solicitudes**.  
4. Eliminar una solicitud enviada.  

**Resultado actual:**  
Después de eliminar la solicitud, aparece un mensaje de confirmación y luego una pantalla en blanco sin contenido.

**Resultado esperado:**  
Una vez eliminada la solicitud, la aplicación debería redirigir automáticamente al **inicio (home)** o actualizar la lista de solicitudes, sin mostrar una pantalla vacía.

### Problema 6: Imagen recortada en la vista de solicitud de mascota
**Rol del usuario:** Adoptante (usuario normal)

**Descripción:**  
En la vista donde se visualiza la **solicitud enviada para una mascota**, la imagen principal de la mascota aparece **recortada o mal ajustada** dentro del contenedor.  
Esto genera un problema visual en la presentación de la publicación, ya que no se muestra correctamente la foto completa.

**Pasos para reproducir:**
1. Iniciar sesión como usuario normal.  
2. Enviar una solicitud de adopción para alguna mascota.  
3. Acceder nuevamente a la vista de **ver solicitud**.  

**Resultado actual:**  
La imagen de la mascota se muestra recortada o desproporcionada.

**Resultado esperado:**  
La imagen de la mascota debería mostrarse completa y centrada, manteniendo su relación de aspecto original para asegurar una visualización correcta.
