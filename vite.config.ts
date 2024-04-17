import { defineConfig } from 'vite'
import { resolve } from 'path'
import dts from 'vite-plugin-dts'

export default defineConfig({

    build: {
        manifest: true,
        minify: true,
        reportCompressedSize: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ts-automata',
            fileName: 'index',
            formats: ['es', "cjs"]
        },
    },
    plugins: [
        dts({
            rollupTypes: true,
            outDir: 'dist',
            insertTypesEntry: true,
        })
    ],

    resolve: {
        alias: [
            {
                find: "~",
                replacement: resolve(__dirname, "./src"),
            },
        ],
    },
})
