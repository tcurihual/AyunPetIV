import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/index.ts"],
    format: ["cjs"],
    dts: true,
    clean: true,
    onSuccess: "node dist/index.js",
})
