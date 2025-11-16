# Sprint 3
## AddPetScreen 
- Me tira error al publicar mascota por un problema de id aunque **si se crean las mascotas**
 ERROR  [TypeError: Cannot read property 'id' of undefined]

Code: AddPetScreen.tsx
  186 |             // 4) Guardar publicación local (AsyncStorage) como referencia rápida en mobile
  187 |             const petLocal: LocalPet = {
> 188 |                 id: String(newPost.pet.id ?? Date.now()),
      |                                       ^
  189 |                 ownerName,
  190 |                 name: data.name,
  191 |                 gender: translateGenderToSpanish(data.gender),
Call Stack
  onSubmit (apps/mobile/app/(shelter)/AddPetScreen.tsx:188:39)

## Home de Shelter
- Sigue lo que las publicaciones muestra la especie/raza como Otro

## Dashboard
- Revisar gráficos, no estan tomando datos correctos y en el primer gráfico se sale de la pantalla por la derecha

## Publication/[id]
- Un dador no deberia poder enviar solicitud por ende la opcion no debería estar presente. A no ser que se cambie de idea.
- No sale opcion de borrar mascota al ser propia.

## Request/[id]
- Revisar colores 
- Revisar el objetivo de las notas, ya que obtiene lo que mando de mensaje el adoptante. Se deberia borrar.


## Sugerencias
- Revisar vistas en busqueda de backbuttons mal implementados