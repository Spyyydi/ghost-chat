import messages from '@intlify/unplugin-vue-i18n/messages';
import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import { createRouter, createWebHashHistory } from 'vue-router/auto';
import { routes } from 'vue-router/auto-routes';

import App from './App.vue';
import IpcHandler from './lib/ipchandler';
import './assets/css/index.css';

const router = createRouter({
    routes,
    history: createWebHashHistory(),
});

IpcHandler.getGeneral()
    .then((general) => {
        const i18n = createI18n<false>({
            locale: general.language,
            fallbackLocale: 'en-US',
            messages,
            legacy: false,
        });

        createApp(App)
            .use(router)
            .use(i18n)
            .mount('#app');
    })
    .catch((error) => {
        console.error(error);
    });
