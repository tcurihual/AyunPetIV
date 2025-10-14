#!/usr/bin/env node

/**
 * Script de prueba para los endpoints de códigos de verificación
 * Ejecutar después de iniciar el servicio entities
 */

const BASE_URL = "http://localhost:5000"

// Token de prueba (necesitarás reemplazar con un token válido)
const TEST_TOKEN = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." // Reemplaza con token real
const TEST_USER_ID = 1 // Reemplaza con un ID de usuario válido

async function testCreateVerificationCode() {
    console.log("\n🧪 Probando crear código de verificación...")

    const testCases = [
        { type: "verify", duration: 30 }, // 30 minutos
        { type: "reset", userId: TEST_USER_ID },
        { type: "adoption", duration: 60 },
    ]

    const results = []

    for (const testCase of testCases) {
        try {
            const response = await fetch(`${BASE_URL}/verification-codes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: TEST_TOKEN,
                },
                body: JSON.stringify(testCase),
            })

            const data = await response.json()

            if (response.ok) {
                console.log(`✅ Código ${testCase.type} creado:`, data.data.code)
                results.push({ ...testCase, code: data.data.code, success: true })
            } else {
                console.log(`❌ Error creando código ${testCase.type}:`, data.message)
                results.push({ ...testCase, error: data.message, success: false })
            }
        } catch (error) {
            console.log(`💥 Error de conexión para ${testCase.type}:`, error.message)
            results.push({ ...testCase, error: error.message, success: false })
        }
    }

    return results
}

async function testValidateVerificationCode(codes) {
    console.log("\n🔍 Probando validar códigos de verificación...")

    for (const codeTest of codes) {
        if (!codeTest.success || !codeTest.code) continue

        try {
            const response = await fetch(`${BASE_URL}/verification-codes/validate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code: codeTest.code,
                    type: codeTest.type,
                    userId: codeTest.userId || TEST_USER_ID,
                }),
            })

            const data = await response.json()

            if (response.ok) {
                console.log(`✅ Código ${codeTest.type} validado correctamente`)
            } else {
                console.log(`❌ Error validando código ${codeTest.type}:`, data.message)
            }
        } catch (error) {
            console.log(`💥 Error de conexión validando ${codeTest.type}:`, error.message)
        }
    }
}

async function testGetUserCodes() {
    console.log("\n📋 Probando obtener códigos de usuario...")

    try {
        const response = await fetch(`${BASE_URL}/verification-codes/user/${TEST_USER_ID}`, {
            method: "GET",
            headers: {
                Authorization: TEST_TOKEN,
            },
        })

        const data = await response.json()

        if (response.ok) {
            console.log(`✅ Códigos del usuario obtenidos: ${data.data.length} códigos encontrados`)
            data.data.forEach((code, index) => {
                console.log(
                    `  ${index + 1}. Tipo: ${code.type}, Usado: ${code.used}, Expira: ${
                        code.expires_at
                    }`
                )
            })
        } else {
            console.log("❌ Error obteniendo códigos:", data.message)
        }
    } catch (error) {
        console.log("💥 Error de conexión obteniendo códigos:", error.message)
    }
}

async function testValidationErrors() {
    console.log("\n🚫 Probando manejo de errores...")

    const errorTests = [
        {
            name: "Tipo inválido",
            endpoint: "/verification-codes",
            method: "POST",
            body: { type: "invalid", userId: TEST_USER_ID },
            headers: { Authorization: TEST_TOKEN },
        },
        {
            name: "Código muy corto",
            endpoint: "/verification-codes/validate",
            method: "POST",
            body: { code: "123", type: "verify", userId: TEST_USER_ID },
        },
        {
            name: "Código inexistente",
            endpoint: "/verification-codes/validate",
            method: "POST",
            body: { code: "999999", type: "verify", userId: TEST_USER_ID },
        },
    ]

    for (const test of errorTests) {
        try {
            const response = await fetch(`${BASE_URL}${test.endpoint}`, {
                method: test.method,
                headers: {
                    "Content-Type": "application/json",
                    ...test.headers,
                },
                body: JSON.stringify(test.body),
            })

            const data = await response.json()

            if (!response.ok) {
                console.log(`✅ Error esperado para '${test.name}': ${data.message}`)
            } else {
                console.log(`❌ Debería haber fallado '${test.name}' pero fue exitoso`)
            }
        } catch (error) {
            console.log(`💥 Error de conexión en '${test.name}':`, error.message)
        }
    }
}

async function runAllTests() {
    console.log("🚀 Iniciando pruebas de códigos de verificación")
    console.log("⚠️  Asegúrate de que el servicio entities esté corriendo en el puerto 5000")
    console.log("⚠️  Y que tengas un token y userId válidos configurados")

    try {
        // Probar crear códigos
        const codes = await testCreateVerificationCode()

        // Esperar un segundo antes de validar
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Probar validar códigos
        await testValidateVerificationCode(codes)

        // Esperar un segundo antes de obtener códigos
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Probar obtener códigos
        await testGetUserCodes()

        // Probar manejo de errores
        await testValidationErrors()

        console.log("\n✨ Pruebas completadas")
    } catch (error) {
        console.error("💥 Error ejecutando pruebas:", error)
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    runAllTests()
}

module.exports = { runAllTests }
