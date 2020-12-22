import Vue from 'vue'
import App from './App.vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

require('dotenv').config();

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
