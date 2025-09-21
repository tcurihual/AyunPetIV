// apps/mobile/src/data/mock_ayun.ts
export default {
    role: [
        { id: 1, roletype: "fundacion" },
        { id: 2, roletype: "adoptante" },
    ],
    users: [
        { id: 1, role: 1, email: "contacto@patitasfelices.cl", name: "Fundación Patitas Felices" },
        { id: 2, role: 2, email: "juanperez@gmail.com", name: "Juan Pérez" },
        { id: 3, role: 1, email: "hola@faa.cl", name: "Fundación Amigos de los Animales" },
        { id: 4, role: 2, email: "maria.lopez@example.com", name: "María López" },
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
        {
            id: 102,
            ownerid: 3,
            species: "Gato",
            name: "Michi",
            gender: "Hembra",
            age: 2,
            size: "Pequeño",
            sterilized: false,
            adopted: false,
            image: require("@/assets/images/Gato1-1.jpg"),
            description: "Gata tranquila y sociable",
        },
        {
            id: 103,
            ownerid: 1,
            species: "Perro",
            name: "Rocky",
            gender: "Macho",
            age: 1,
            size: "Grande",
            sterilized: false,
            adopted: false,
            image: require("@/assets/images/perro2.jpg"),
            description: "Energético, ideal para familias activas",
        },
        {
            id: 104,
            ownerid: 3,
            species: "Gato",
            name: "Luna",
            gender: "Hembra",
            age: 4,
            size: "Mediano",
            sterilized: false,
            adopted: false,
            image: require("@/assets/images/Gato1-2.jpg"),
            description: "Cariñosa y muy tranquila en interiores",
        },
    ],
    post: [
        {
            id: 201,
            creatorid: 1,
            petid: 101,
            title: "Firulais en adopción",
            description: "Muy juguetón y cariñoso",
            status: "active",
            createdat: "2025-09-10T00:00:00Z",
        },
        {
            id: 202,
            creatorid: 3,
            petid: 102,
            title: "Michi en adopción",
            description: "Gata tranquila y sociable",
            status: "closed",
            createdat: "2025-09-08T00:00:00Z",
        },
        {
            id: 203,
            creatorid: 1,
            petid: 103,
            title: "Rocky en adopción",
            description: "Energético, ideal para familias activas",
            status: "active",
            createdat: "2025-09-09T00:00:00Z",
        },
    ],

    adoption_request: [
        {
            id: 301,
            petid: 101,
            requesterid: 2, // Juan Pérez
            status: "pending",
            message: "Tengo patio grande y experiencia cuidando perros.",
            createdat: "2025-09-11T12:00:00Z",
        },
        {
            id: 302,
            petid: 102,
            requesterid: 4, // María López
            status: "accepted",
            message: "Busco una gata tranquila para departamento.",
            createdat: "2025-09-12T09:30:00Z",
        },
        {
            id: 303,
            petid: 103,
            requesterid: 2,
            status: "rejected",
            message: "Solo podría visitarlo los fines de semana.",
            createdat: "2025-09-12T15:45:00Z",
        },
    ],

    adoption_history: [
        {
            id: 401,
            petid: 102, // Michi
            adopterid: 4, // María López
            date: "2025-09-13T10:00:00Z",
            notes: "Proceso completado en buenas condiciones.",
        },
    ],

    message: [
        {
            id: 501,
            fromid: 2, // Juan Pérez
            toid: 1, // Fundación Patitas Felices
            content: "Hola, quisiera más detalles sobre Firulais.",
            timestamp: "2025-09-11T14:00:00Z",
        },
        {
            id: 502,
            fromid: 1,
            toid: 2,
            content: "Firulais es muy activo, necesita espacio para correr.",
            timestamp: "2025-09-11T14:10:00Z",
        },
    ],

    report: [
        {
            id: 601,
            reporterid: 2, // Juan Pérez
            petid: 103,
            reason: "La información del estado de salud no está clara.",
            createdat: "2025-09-12T18:20:00Z",
        },
        {
            id: 602,
            reporterid: 4, // María López
            petid: 101,
            reason: "El publicador no responde a los mensajes.",
            createdat: "2025-09-13T08:15:00Z",
        },
    ],
}
