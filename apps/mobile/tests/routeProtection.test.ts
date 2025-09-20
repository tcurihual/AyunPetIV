export const testRouteProtection = {
    scenarios: [
        {
            name: "Usuario no autenticado accede a raíz",
            action: "Navigate to /",
            expected: "Redirect to /(auth)",
            test: () => console.log("Testing unauthenticated root access"),
        },
        {
            name: "Usuario no autenticado accede a home",
            action: "Navigate to /(home)",
            expected: "Redirect to /(auth)",
            test: () => console.log("Testing unauthenticated home access"),
        },
        {
            name: "Usuario autenticado accede a auth",
            action: "Navigate to /(auth)",
            expected: "Redirect to /(home)",
            test: () => console.log("Testing authenticated auth access"),
        },
    ],
}
