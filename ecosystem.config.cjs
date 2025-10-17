module.exports = {
    apps: [
        {
            name: "gateway",
            cwd: "./apps/gateway",
            script: "dist/index.js",
            interpreter: "node",
            env: { NODE_ENV: "production", PORT: "3000" },
        },
        {
            name: "auth",
            cwd: "./apps/auth",
            script: "dist/index.js",
            interpreter: "node",
            env: { NODE_ENV: "production", PORT: "4000" },
        },
        {
            name: "entities",
            cwd: "./apps/entities",
            script: "dist/index.js",
            interpreter: "node",
            env: { NODE_ENV: "production", PORT: "5000" },
        },
        {
            name: "adoptions",
            cwd: "./apps/adoptions",
            script: "dist/index.js",
            interpreter: "node",
            env: { NODE_ENV: "production", PORT: "6000" },
        },
        {
            name: "media",
            cwd: "./apps/media",
            script: "dist/index.js",
            interpreter: "node",
            env: { NODE_ENV: "production", PORT: "7000" },
        },
    ],
}
