/**
 * Formatea la edad de una mascota en un texto legible
 * @param years Años de edad
 * @param months Meses de edad
 * @returns String formateado con la edad
 */
export function formatAge(years?: number | null, months?: number | null): string {
    const y = Number(years) || 0
    const m = Number(months) || 0

    // Si no hay edad definida
    if (y === 0 && m === 0) {
        return "Edad desconocida"
    }

    // Solo meses (menos de 1 año)
    if (y === 0 && m > 0) {
        return m === 1 ? "1 mes" : `${m} meses`
    }

    // Solo años (sin meses adicionales)
    if (y > 0 && m === 0) {
        return y === 1 ? "1 año" : `${y} años`
    }

    // Años y meses
    const yearsText = y === 1 ? "1 año" : `${y} años`
    const monthsText = m === 1 ? "1 mes" : `${m} meses`
    return `${yearsText} y ${monthsText}`
}

/**
 * Formatea la edad desde un objeto que puede contener diferentes formatos
 * @param pet Objeto que puede tener age_years, age_months o age (string/number)
 * @returns String formateado con la edad
 */
export function formatAgeFromObject(pet: any): string {
    // Si tiene age_years y age_months definidos
    if (pet?.age_years !== undefined || pet?.age_months !== undefined) {
        return formatAge(pet.age_years, pet.age_months)
    }

    // Si tiene age como string
    if (typeof pet?.age === "string") {
        const ageStr = pet.age.trim()
        
        // Si está vacío o es undefined/null
        if (!ageStr || ageStr === "undefined" || ageStr === "null") {
            return "Edad desconocida"
        }

        // Si ya está formateado (ej: "2 años", "5 meses")
        if (ageStr.includes("año") || ageStr.includes("mes")) {
            return ageStr
        }

        // Si es un número en string
        const numAge = Number(ageStr)
        if (!isNaN(numAge)) {
            return formatAge(numAge, 0)
        }

        return ageStr
    }

    // Si tiene age como number
    if (typeof pet?.age === "number") {
        return formatAge(pet.age, 0)
    }

    return "Edad desconocida"
}
