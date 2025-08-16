import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './SafeApp.vue'

const app = createApp(App)

app.mount('#app')