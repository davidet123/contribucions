import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import router from './router'
import App from './App.vue'
import './assets/main.css'

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'amedia',
    themes: {
      amedia: {
        dark: false,
        colors: {
          primary: '#E8001C',
          secondary: '#1A1A2E',
          accent: '#F5A623',
          background: '#F4F2EE',
          surface: '#FFFFFF',
          'surface-variant': '#EFEFEF',
          cct: '#FADADD',
          'cct-border': '#E8001C',
          success: '#2E7D32',
          warning: '#F57C00',
          error: '#C62828',
          info: '#1565C0',
          'on-primary': '#FFFFFF',
          'on-secondary': '#FFFFFF',
        }
      }
    }
  },
  defaults: {
    VBtn: { variant: 'flat', rounded: 'lg' },
    VCard: { rounded: 'lg', elevation: 0 },
    VTextField: { variant: 'outlined', density: 'comfortable' },
    VSelect: { variant: 'outlined', density: 'comfortable' },
    VTextarea: { variant: 'outlined', density: 'comfortable' },
    VChip: { rounded: 'md' },
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(vuetify)
app.mount('#app')
