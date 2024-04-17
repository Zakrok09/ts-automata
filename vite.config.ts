import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({

    build: {
        manifest: true,
        minify: true,
        reportCompressedSize: true,
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'ts-automata',
            fileName: 'ts-automata',
            formats: ['es']
        },
    },

    resolve: {
        alias: [
            {
                find: "~",
                replacement: resolve(__dirname, "./src"),
            },
        ],
    },
})
