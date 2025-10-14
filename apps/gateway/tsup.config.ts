import { defineConfig } from "tsup"

export default defineConfig({
    entry: ["src/**/*.ts"],
    outDir: "dist",
    format: ["cjs"],
    clean: true,
    bundle: false,
    dts: false,
    sourcemap: false,
    target: "node20",
})
