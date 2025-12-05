import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default ({ mode }) => {
    // Carrega as variáveis de ambiente do arquivo .env
    const env = loadEnv(mode, process.cwd(), '');
    const coingeckoApiKey = "CG-Ys3DjK3YzKPLBmdTmvEQWFG7";

    // https://vitejs.dev/config/
    return defineConfig({
        plugins: [react()],
        resolve: {
            alias: {
                buffer: 'buffer/',
            },
        },
        server: {
            proxy: {
                '/api/coingecko': {
                    target: 'https://api.coingecko.com/api/v3',
                    changeOrigin: true,
                    rewrite: (path) => {
                        const newPath = path.replace(/^\/api\/coingecko/, '');
                        const separator = newPath.includes('?') ? '&' : '?';
                        const url = `${newPath}${separator}x_cg_demo_api_key=${coingeckoApiKey}`;
                        // console.log('url: ', url);
                        return url;
                    },
                },
            },
        }
    });
}