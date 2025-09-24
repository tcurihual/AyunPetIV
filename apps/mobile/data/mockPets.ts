import { Pet } from "@/interfaces/pet"

export const mockPets: Pet[] = [
    {
        id: "1",
        name: "Firulais",
        gender: "Macho",
        age: "2 años",
        publisher: "Fundación X",
        description: "Muy juguetón y cariñoso",
        image: require("@/assets/images/perro1.jpg"),
    },
    {
        id: "2",
        name: "Pelusa",
        gender: "Hembra",
        age: "1 año",
        publisher: "Fundación X",
        description: "Gata tranquila y sociable",
        image: require("@/assets/images/Gato1-1.jpg"),
    },
    {
        id: "3",
        name: "Ayudante de Santa",
        gender: "Macho",
        age: "3 años",
        publisher: "Fundación X",
        description: "Energético, ideal para familias activas",
        image: require("@/assets/images/perro2.jpg"),
    },
    {
        id: "4",
        name: "Bola de nieve",
        gender: "Hembra",
        age: "6 meses",
        publisher: "Fundación X",
        description: "Cariñosa y muy tranquila en interiores",
        image: require("@/assets/images/Gato1-2.jpg"),
    },
]
