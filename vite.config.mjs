// Plugins
import Components from 'unplugin-vue-components/vite'
import Vue from '@vitejs/plugin-vue'
import Vuetify, {transformAssetUrls} from 'vite-plugin-vuetify'
import ViteFonts from 'unplugin-fonts/vite'

// Utilities
import {defineConfig} from 'vite'
import {fileURLToPath, URL} from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        Vue({
            template: {transformAssetUrls}
        }),
        // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
        Vuetify(),
        Components(),
        ViteFonts({
            google: {
                families: [{
                    name: 'Roboto',
                    styles: 'wght@100;300;400;500;700;900',
                }],
            },
        }),
    ],
    define: {'process.env': {}},
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
        extensions: [
            '.js',
            '.json',
            '.jsx',
            '.mjs',
            '.ts',
            '.tsx',
            '.vue',
        ],
    },
    server: {
        host: '0.0.0.0',
        port: 3300,
        hmr: {
            protocol: 'ws',
            host: 'localhost',
            port: 3300
        },
        proxy: {
            '/api': {
                target: 'http://47.245.60.188:8080/client',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/api/, '') // 去掉 /api 前缀
            },
        },
    },
    optimizeDeps: {
        include: [
            'markdown-it',
            'markdown-it-katex',
            'highlight.js',
            'github-markdown-css'
        ]
    }
})
