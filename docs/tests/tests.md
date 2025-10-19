# Testeos de Adoption Requests
- Se verifica que el usuario puede crear solicitudes(usuario 1 y usuario 13)
- Se verifica que el usuario puede obtener sus propias solicitudes
- Se verifica que el giver puede obtener las solicitudes de sus posts
- Se verifica que el usuario que hizo la solicitud puede editar
  - Puede editar
    - mensaje
    - status a pending y rejected?  
  - No puede editar:
     - status a approved, completed
- Se verifica que el usuario que creo el post(giver):
 - puede editar
   - el mensaje??? porque lo hace?
   - el id pero no lo cambia(correct), entonces el problema es el mensaje de respuesta esta incorrecto
   - lo mismo con el id de requester y post owner
   - status se puede cambiar a rejected,pending, accepted y a completed(esto no deberia ya que se debe confirmar por codigo?)
  - no puede editar
   - status de tipo de dato, osea el mensaje debe ser mas claro XD
- Se verifica que el usuario que no creo el post y tambien es giver supongo:
   - No puede editar:
    - status en su totalidad
    - id tampoco
   - puede editar:
    - No
- Se verifica con otro usuario de rol 20 
  - no puede editar:
    - mensaje
    - status en su totalidad
    - IDs
- Se verifica con usuario admin:
  - no puede editar:
    - mensaje
    - status
    - IDs

- Solo el usuario que creo la solicitud puede borrarla
   - Una vez que se hace la peticion de borrar esta se elimina pero manda un error 500 a pesar de que si se cumplio

# Resumen de Problemas Pendientes

- el usuario que hace la solicitud puede editar su status a rejected y/o pending? pending se hace por default al hacer la solicitud pero si el usuario quiere cancelar la solicitud el rejected no se debe utilizar, ya que el propio usuario puede eliminarla con DELETE **[Arreglado]**
- EL usuario que creo la Request al hacer DELETE tira error 500 pero la peticion si es completada **[Arreglado]**
- El usuario giver que creo el post no deberia poder editar el mensaje de la solicitud **[Arreglado]**
- El mismo usuario no puede cambiar los IDs pero el mensaje de Respuesta dice que los datos se actualizaron aunque no lo hayan hecho, incluso muestra que el id no cambio. **[Arreglado]**
- Revisar lo de confirmed y como se debe hacer lo de la clave **[Se debe revisar mas adelante en la siguiente tarea de Actualizar el contexto de adoption Request]**

