### Mobile

-   implementar registro mobile con api
-   vista sobre ayunpet
-   vista configuración
-   prevenir que usuario cambie correo, rut en appmobile
-   menu desplegable no contiene la imagen del usuario, ni nombre ni correo
-   se esta en un perfil de usuario normal pero se muestra publicaciones (que hace ver todas?) si es un usuario normal se deberian mostrar su datos de inmediato, no tener que ingresar a ver datos, etc
-   usuario podria ver sus solicitudes pero no llamar a un modal que acepte / rechace solicitud
-   navbar inferior apartado de lupa no muestra el background distinto a diferencia de los demas botones
-   boton de cerrar sesion en mi perfil devuelve a login malo
-   endpoint que permita al usuario generar una solicitud de creación de cuenta
-   endpoint que permita que le usuario escale de rol usuario -> giver

### API

-   creación de publicaciones con tipos antiguos, además al no existir datos en la bd, se puede intuir que los endpoins no fueron probados correctamente
-   CRUD messages con tipos desactualizados
-   Multiples problemas en los controladores de Request (detallados en el código con TODO y FIXME)
-   tipos desactualizados
-   messages no contienen middlewares
-   publications falta middleware de pertenencia
-   reports sin middlewares
-   request sin middlewares
-   adoptionrequest tipos desactualizados
-   endpoints adoptionRequest sin middlewares
-   user endpints sin middleware de pertenencia
