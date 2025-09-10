# ¿Qué es una API?

Una API (Interfaz de Programación de aplicaciones) es un conjunto de mecanismos que permite a dos partes sin relación entre sí comunicarse por medio de definiciones y protocolos. En otras palabras permite la transmision de información entre si, sin necesidad de que uno conozca los detalles de implementación del otro.

Siendo más especifico en el significado de API tenemos:

-   Aplicación: Cualquier software con una función distinta
-   Interfaz: Se puede considerar como un contrato de servicio entre dos aplicaciones. Es aquí donde se define como se comunican entre sí mediante solicitudes y respuestas

La explicación de las API se da en términos de cliente y servidor. Para contextualizar:

-   Cliente: Aplicación que envía solicitud
-   Servidor: Aplicación que envía la respuesta

Dentro de los tipos de API, nosotros requerimos de la API REST. Esta transmite los datos cliente-servidor mediante el protocolo HTTP, permitiendo que el servidor puedan definir a una gran variedad de funciones como GET, POST, DELETE, UPDATE, para luego recibir peticiones de parte del cliente.

#### Un ejemplo de flujo general seria:

1.  Cliente envia las solicitudes del servidor como datos.
2.  Servidor utiliza la entrada del cliente para iniciar funciones internas.
3.  Servidor devuelve los datos de salida al cliente.

#### Endpoints:

Como su nombre lo dice son los ultimos puntos de contacto para la comunicación en una API. Estas son URLs especificas del servidor desde las que se envia y recibe información entre sistemas. Es importante y fundamental tener en cuenta que:

-   Endpoints mal diseñados o poco protegidos, vuelven vulnerable y propenso al sistema de recibir ataques
-   Los Endpoints con alto tráfico pueden generar cuellos de botella y afectar el rendimiento del sistema

#### Entonces ¿Como la protegemos?

Para nuestro caso esto se manejara con tokens de autenticación. Estos comprueban que los usuarios son quienes dicen ser y que tienen los derechos de acceso para la llamada a esa API.

#### Relación con nuestra arquitectura:

Implementar una API REST con nuestra arquitectura de microservicios nos conviene en gran medida, ya que:

-   Evitamos cuellos de botella hacia un mismo endpoint al tener la logica repartida en distintos microservicios
-   La seguridad _Solo se maneja en el microservicio de AUTH_, esto permite que la obtención y refresco de tokens solo se realice dentro de este microservicio, volviendo el sistema mas robusto
-   Escalabilidad, al tener la logica separada, tambien es asi con los endpoints, permitiendo cambiar y crear sobre la marcha

#### Aplicación:

Dado el estudio e investigación, se decide seguir de la forma en la que se esta llevando, la cual es mantener los endpoints de nuetra API dentro de cada microservicio, esto no disminuye la carga de trabajo ni el objetivo principal del desarrollo de API, para el equipo de Integración IV, se plantea la siguiente tarea:

    Desarrollar tarea para generación de un documento extenso de como se definirá cada endpoint importante dentro de la aplicación, esto conlleva pensar y analizar en todos los casos que plataformas cliente requieran enviar y recibir datos por parte del servidor, generando:

    - Endpoint (Metodo HTTP y URL)
    - Elementos (entidades) que requiere el Endpoint
    - Formato JSON que recibe el Endpoint (Request Body)
    - Valores, formato JSON y codigos de estado que retorna el Endpoint (Response Body)
    - Ejemplos de como usar los Endpoints
    - Ejemplo a nivel código de como implementar cada Endpoint
    - Ejemplo de como realizar pruebas con herramientas como ThunderClient, Postman

##### Conclusiones:

Nuestra estrategia actual se enfoca en reforzar y documentar exhaustivamente los endpoints de cada microservicio, ya que la implementación a nivel código de un Endpoint es relativamente sencilla. Todo el conjunto de tecnologias que permiten que la API funcione correctamente esta implementado desde el comienzo del sprint 1. Dentro del sprint 1, no se contempla la aplicación de un api gateway, actualmente se esta trabajando con nginx, y funcionalidades mas complejas no son requeridas

Esta desición permite que nos centremos en la estructura y funcionamiento del sistema a nivel general y además nos permite ayudar a los integrantes de II, de una forma mucho mas conjunta.
