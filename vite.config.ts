import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "src/index.ts"),
            fileName: "index",
            formats: ["es", "cjs"],
            name: "ts-automata",
        },
        manifest: true,
        minify: true,
        reportCompressedSize: true,
        
    },
    plugins: [
        dts({
            insertTypesEntry: true,
            outDir: "dist",
            rollupTypes: true,

        })
    ]


});
