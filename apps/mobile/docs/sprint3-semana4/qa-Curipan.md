# Reporte de Sesión de QA – Proyecto Ayün Pet

## Problemas encontrados

### Problema 1: DropdownMenu permanece abierto al navegar por el navbar
**Rol del usuario:** Todos (usuario normal, refugio y administrador)

**Descripción:**  
El componente **DropdownMenu.tsx**, que actúa como menú desplegable en la aplicación, se abre correctamente al ser presionado.  
Sin embargo, si el menú está abierto y el usuario navega hacia otra vista usando los botones del **navbar**, el menú **permanece abierto**, superponiéndose a la nueva pantalla.  
Este comportamiento afecta la experiencia de usuario y rompe la coherencia visual.

**Pasos para reproducir:**
1. Iniciar sesión con cualquier tipo de usuario.  
2. Abrir el menú desplegable (DropdownMenu).  
3. Sin cerrar el menú, navegar a otra vista utilizando los botones del navbar.  

**Resultado actual:**  
El menú desplegable queda abierto incluso después de cambiar de vista, permaneciendo encima del contenido.

**Resultado esperado:**  
Al navegar a cualquier otra vista desde el navbar, el menú desplegable debería **cerrarse automáticamente**.

### Problema 2: Duplicación del botón de retroceso en vistas del rol dador
**Rol del usuario:** Dador / Refugio (roles 21 y 22)

**Descripción:**  
En las vistas del usuario dador, el componente **BackButton** aparece duplicado.  
Cuando el usuario ingresa al home y navega hacia otras vistas, se muestran **dos botones de retroceso**:
- Uno que reemplaza el ícono del menú desplegable en el header (este está correcto).  
- Un segundo botón que aparece dentro del contenido de la vista (este **no debería estar ahí**).  

Esto provoca una inconsistencia visual y puede confundir al usuario.

**Pasos para reproducir:**
1. Iniciar sesión como dador o refugio (roles 21 o 22).  
2. Entrar al home correspondiente a este rol.  
3. Navegar a cualquier otra vista.  

**Resultado actual:**  
Aparecen dos botones de “volver atrás”:  
- Uno en el header (correcto).  
- Uno dentro de la vista (incorrecto).

**Resultado esperado:**  
Solo debería mostrarse **un** BackButton, ubicado en el header reemplazando el menú desplegable.  
No debería mostrarse un segundo botón dentro de la vista.

### Problema 3: Botón “Mis publicaciones” aparece para usuario normal en el filtro
**Rol del usuario:** Adoptante (rol 20)

**Descripción:**  
En el componente de **filtro** ubicado en el home del usuario normal, aparece un botón adicional llamado **“Mis publicaciones”**.  
Este botón no corresponde a este rol, ya que la sección de publicaciones solo debe estar disponible para los usuarios dadores (roles 21 y 22).

**Pasos para reproducir:**
1. Iniciar sesión como usuario normal (rol 20).  
2. Entrar al home y abrir el componente de filtro.  
3. Observar los botones disponibles dentro del filtro.  

**Resultado actual:**  
Se muestra el botón “Mis publicaciones”, a pesar de que el usuario normal no tiene acceso a esa funcionalidad.

**Resultado esperado:**  
El botón “Mis publicaciones” solo debería estar visible para los roles dadores (21 y 22), y no debería mostrarse en el filtro del usuario normal.

### Problema 4: Login recordado no redirige al home después de iniciar sesión
**Rol del usuario:** Adoptante (rol 20) y Dador/Refugio (rol 21)

**Descripción:**  
Al iniciar sesión y luego cerrar sesión, la aplicación redirige correctamente al **login con usuario recordado**, donde solo se solicita la contraseña o la huella digital.  
El problema ocurre al intentar volver a iniciar sesión desde esta pantalla:

- El usuario ingresa la contraseña o usa la huella.  
- Aparece el mensaje **“Inicio de sesión exitoso”** y se muestra el loading.  
- Pero **no redirige al home**, quedando detenido en la pantalla de login recordado.  
- Si el usuario ingresa la contraseña nuevamente, aparece el mensaje **“Inicio de sesión exitoso. Redirigiendo...”**, pero el resultado es el mismo.  

Si se cierra completamente la aplicación y se vuelve a abrir, entonces sí aparece el home con la sesión ya iniciada.

**Pasos para reproducir:**
1. Iniciar sesión con un usuario normal (rol 20) o dador (rol 21).  
2. Cerrar sesión desde el menú correspondiente.  
3. En el login recordado, ingresar contraseña o usar la huella.  
4. Observar el mensaje de éxito y el comportamiento del loading.  

**Resultado actual:**  
A pesar de mostrar éxito en el login, el sistema **no redirige al home** y permanece en la pantalla de login recordado.  
Solo al cerrar y volver a abrir la app se entra al home.

**Resultado esperado:**  
Después de un inicio de sesión exitoso desde el login recordado, la aplicación debe **redirigir automáticamente al home** del usuario correspondiente sin necesidad de reiniciar la app.
