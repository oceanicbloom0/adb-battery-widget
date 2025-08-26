import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import Settings from './Settings.vue'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
  components,
  directives
})

// very tiny hash-based view switcher, no router dependency
function mount() {
  const app = createApp(location.hash === '#/settings' ? Settings : App)
  app.use(vuetify)
  app.mount('#app')
}

window.addEventListener('hashchange', () => mount())
mount()
