import { defineConfig } from "vite";
import { resolve } from "path";
import { builtinModules } from "module";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        lib: {
            entry: {
                "dymo-api": resolve(__dirname, "src/dymo-api.ts")
            }
        },
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            external: [
                ...builtinModules,
                ...builtinModules.map(m => `node:${m}`),
                ...builtinModules.map(m => `${m}/promises`),
                "axios",
                "@react-email/render",
                "tw-to-css",
                "react"
            ],
            output: [
                {
                    format: "es",
                    entryFileNames: "esm/[name].js",
                    chunkFileNames: "esm/_shared/[name]-[hash].js"
                },
                {
                    format: "cjs",
                    entryFileNames: "cjs/[name].cjs",
                    chunkFileNames: "cjs/_shared/[name]-[hash].cjs"
                }
            ]
        },
        target: "ES2020",
        minify: false
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src")
        }
    },
    plugins: [
        dts({
            outDir: "dist/types",
            include: ["src/**/*"],
            exclude: ["**/*.test.ts", "**/*.spec.ts"],
            insertTypesEntry: true
        })
    ]
});