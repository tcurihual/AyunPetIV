
export function validarRUT(rut: string): boolean {
    // Quitar puntos y guion
    const cleanRut = rut.replace(/\./g, "").replace("-", "").toUpperCase();

    if (cleanRut.length < 2) return false;

    const cuerpo = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);

    // Validar solo números en el cuerpo
    if (!/^\d+$/.test(cuerpo)) return false;

    let suma = 0;
    let multiplicador = 2;

    // Recorremos el RUT de derecha a izquierda
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i]) * multiplicador;
        multiplicador = multiplicador < 7 ? multiplicador + 1 : 2;
    }

    const resto = suma % 11;
    const dvEsperado = 11 - resto === 11 ? "0" : 11 - resto === 10 ? "K" : String(11 - resto);

    return dv === dvEsperado;
}
