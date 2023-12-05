import { mergeConfig, type UserConfig } from "vite";

import common from "./vite.common";

const config: UserConfig = {
    server: {
        port: 3900,
        strictPort: true,
        cors: false,
        host: "0.0.0.0",
        proxy: {
            '/api': {
              target: 'http://192.168.1.8:8000/',
              changeOrigin: true,
              secure: false,
            },
        },
    },
    preview: {
        port: 3900,
        strictPort: true,
        cors: false,
        host: "0.0.0.0",
        proxy: {
            '/api': {
              target: 'http://192.168.1.8:8000/',
              changeOrigin: true,
              secure: false,
            },
        },
    },

    define: {
        API_URL: JSON.stringify("http://localhost:8080/api")
    }
};

export default mergeConfig(common, config);
