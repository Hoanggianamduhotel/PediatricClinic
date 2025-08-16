import { createApp } from 'vue'
import MinimalApp from './MinimalApp.vue'

console.log('Starting minimal app...')

const app = createApp(MinimalApp)
app.mount('#app')

console.log('Minimal app mounted successfully!')