#!/usr/bin/env node

/**
 * Script de prueba para los endpoints móviles de recuperación de contraseña
 *
 * Flujo de prueba:
 * 1. POST /v1/auth/mobile/reset-password - Genera código de 6 dígitos
 * 2. POST /v1/auth/mobile/verify-reset-code - Valida código y cambia contraseña
 */

const https = require("https")
const http = require("http")

// Configuración
const BASE_URL = "http://localhost:3000" // Gateway
const TEST_EMAIL = "test@ayunpet.com" // Cambiar por email válido en tu BD
const NEW_PASSWORD = "nuevaPassword123"

// Función auxiliar para hacer requests HTTP
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const client = options.protocol === "https:" ? https : http

        const req = client.request(options, (res) => {
            let data = ""
            res.on("data", (chunk) => (data += chunk))
            res.on("end", () => {
                try {
                    const jsonData = JSON.parse(data)
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData,
                    })
                } catch (e) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                    })
                }
            })
        })

        req.on("error", reject)

        if (postData) {
            req.write(postData)
        }

        req.end()
    })
}

// Colores para la consola
const colors = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    reset: "\x1b[0m",
    bold: "\x1b[1m",
}

function log(color, message) {
    console.log(color + message + colors.reset)
}

// Función principal de pruebas
async function testMobilePasswordReset() {
    try {
        log(colors.cyan + colors.bold, "\n🧪 === INICIANDO PRUEBAS DE RECUPERACIÓN MÓVIL ===\n")

        // ================================
        // PASO 1: Generar código de reset
        // ================================
        log(colors.blue, "📧 Paso 1: Solicitando código de recuperación...")

        const resetOptions = {
            hostname: "localhost",
            port: 3000,
            path: "/v1/auth/mobile/reset-password",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }

        const resetPayload = JSON.stringify({
            email: TEST_EMAIL,
        })

        const resetResponse = await makeRequest(resetOptions, resetPayload)

        log(colors.yellow, `📊 Status: ${resetResponse.statusCode}`)
        console.log("📄 Response:", resetResponse.data)

        if (resetResponse.statusCode !== 200) {
            throw new Error(
                `Error al solicitar código: ${resetResponse.data.message || "Error desconocido"}`
            )
        }

        log(colors.green, "✅ Código de reset generado correctamente")

        // Mostrar el código para testing (si está en respuesta de desarrollo)
        if (resetResponse.data.data && resetResponse.data.data.devCode) {
            log(colors.cyan, `🔑 Código de desarrollo: ${resetResponse.data.data.devCode}`)
        }

        // ================================
        // PASO 2: Solicitar código al usuario
        // ================================
        const readline = require("readline")
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        const askForCode = () => {
            return new Promise((resolve) => {
                rl.question(
                    colors.yellow +
                        "🔢 Ingresa el código de 6 dígitos que recibiste por email: " +
                        colors.reset,
                    (code) => {
                        resolve(code.trim())
                    }
                )
            })
        }

        const userCode = await askForCode()
        rl.close()

        if (!userCode || userCode.length !== 6 || !/^\d{6}$/.test(userCode)) {
            throw new Error("❌ Código inválido. Debe ser un número de 6 dígitos")
        }

        // ================================
        // PASO 3: Verificar código y cambiar contraseña
        // ================================
        log(colors.blue, "\n🔐 Paso 2: Verificando código y cambiando contraseña...")

        const verifyOptions = {
            hostname: "localhost",
            port: 3000,
            path: "/v1/auth/mobile/verify-reset-code",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }

        const verifyPayload = JSON.stringify({
            email: TEST_EMAIL,
            code: userCode,
            newPassword: NEW_PASSWORD,
        })

        const verifyResponse = await makeRequest(verifyOptions, verifyPayload)

        log(colors.yellow, `📊 Status: ${verifyResponse.statusCode}`)
        console.log("📄 Response:", verifyResponse.data)

        if (verifyResponse.statusCode === 200) {
            log(colors.green + colors.bold, "\n🎉 ¡ÉXITO! Contraseña cambiada correctamente")
            log(colors.white, `📧 Email: ${TEST_EMAIL}`)
            log(colors.white, `🔑 Nueva contraseña: ${NEW_PASSWORD}`)
        } else {
            throw new Error(
                `Error al verificar código: ${verifyResponse.data.message || "Error desconocido"}`
            )
        }

        // ================================
        // PASO 4: Probar login con nueva contraseña
        // ================================
        log(colors.blue, "\n🔍 Paso 3: Probando login con nueva contraseña...")

        const loginOptions = {
            hostname: "localhost",
            port: 3000,
            path: "/v1/auth/login",
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }

        const loginPayload = JSON.stringify({
            email: TEST_EMAIL,
            password: NEW_PASSWORD,
        })

        const loginResponse = await makeRequest(loginOptions, loginPayload)

        log(colors.yellow, `📊 Status: ${loginResponse.statusCode}`)

        if (loginResponse.statusCode === 200) {
            log(colors.green + colors.bold, "✅ Login exitoso con nueva contraseña")
            console.log("👤 Usuario:", loginResponse.data.data.user.name)
        } else {
            log(colors.red, "❌ Error en login con nueva contraseña")
            console.log("📄 Response:", loginResponse.data)
        }

        log(colors.cyan + colors.bold, "\n🏁 === PRUEBAS COMPLETADAS ===\n")
    } catch (error) {
        log(colors.red + colors.bold, "\n❌ ERROR EN LAS PRUEBAS:")
        console.error(colors.red + error.message + colors.reset)
        process.exit(1)
    }
}

// Verificar argumentos
if (process.argv.includes("--help")) {
    console.log(`
${colors.cyan}🧪 Script de prueba para recuperación de contraseña móvil${colors.reset}

${colors.yellow}Uso:${colors.reset}
  node test-mobile-reset.js

${colors.yellow}Requisitos:${colors.reset}
  1. Gateway corriendo en puerto 3000
  2. Servicio auth corriendo en puerto 4000  
  3. Base de datos Supabase configurada
  4. Usuario existente con email: ${TEST_EMAIL}

${colors.yellow}Flujo de prueba:${colors.reset}
  1. 📧 POST /v1/auth/mobile/reset-password
  2. 🔢 Ingreso manual del código de 6 dígitos
  3. 🔐 POST /v1/auth/mobile/verify-reset-code
  4. 🔍 Verificación de login con nueva contraseña

${colors.yellow}Personalización:${colors.reset}
  Modifica las constantes TEST_EMAIL y NEW_PASSWORD en el archivo.
`)
    process.exit(0)
}

// Ejecutar pruebas
testMobilePasswordReset()
