export const SpeciesTranslations = {
    toBackend: {
        Perro: "Dog",
        Gato: "Cat",
    } as const,

    toSpanish: {
        Dog: "Perro",
        Cat: "Gato",
    } as const,

    options: [
        { label: "Perro", value: "Dog" },
        { label: "Gato", value: "Cat" },
    ] as const,
}

export const GenderTranslations = {
    toBackend: {
        Macho: "Male",
        Hembra: "Female",
    } as const,

    toSpanish: {
        Male: "Macho",
        Female: "Hembra",
    } as const,

    options: [
        { label: "Macho", value: "Male" },
        { label: "Hembra", value: "Female" },
    ] as const,
}

export const SizeTranslations = {
    toBackend: {
        Pequeño: "Small",
        Mediano: "Medium",
        Grande: "Large",
    } as const,

    toSpanish: {
        Small: "Pequeño",
        Medium: "Mediano",
        Large: "Grande",
    } as const,

    options: [
        { label: "Pequeño", value: "Small" },
        { label: "Mediano", value: "Medium" },
        { label: "Grande", value: "Large" },
    ] as const,
}
export const translateSpeciestoBackend = (species: string): string => {
    return (
        SpeciesTranslations.toBackend[species as keyof typeof SpeciesTranslations.toBackend] ||
        species
    )
}

export const translateSpeciesToSpanish = (species: string): "Perro" | "Gato" | "Otro" => {
    const translation =
        SpeciesTranslations.toSpanish[species as keyof typeof SpeciesTranslations.toSpanish]
    return translation || "Otro"
}

export const translateGenderToBackend = (gender: string): string => {
    return (
        GenderTranslations.toBackend[gender as keyof typeof GenderTranslations.toBackend] || gender
    )
}

export const translateGenderToSpanish = (gender: string): "Macho" | "Hembra" => {
    const translation =
        GenderTranslations.toSpanish[gender as keyof typeof GenderTranslations.toSpanish]
    return translation || "Macho"
}

export const translateSizeToBackend = (size: string): string => {
    return SizeTranslations.toBackend[size as keyof typeof SizeTranslations.toBackend] || size
}

export const translateSizeToSpanish = (size: string): string => {
    return SizeTranslations.toSpanish[size as keyof typeof SizeTranslations.toSpanish] || size
}

export type SpeciesBackend = keyof typeof SpeciesTranslations.toSpanish
export type SpeciesSpanish = keyof typeof SpeciesTranslations.toBackend
export type GenderBackend = keyof typeof GenderTranslations.toSpanish
export type GenderSpanish = keyof typeof GenderTranslations.toBackend
export type SizeBackend = keyof typeof SizeTranslations.toSpanish
export type SizeSpanish = keyof typeof SizeTranslations.toBackend
