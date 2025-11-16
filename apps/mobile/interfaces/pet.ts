import { ImageSourcePropType } from "react-native"
export interface Pet {
    id: string
    name: string
    gender: string
    age: string
    publisher: string
    description: string
    image: ImageSourcePropType
    type?: string | null
}
