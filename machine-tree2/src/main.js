import Vue from 'vue'
import App from './App.vue'
import VueTree from '@ssthouse/vue-tree-chart'

Vue.config.productionTip = false

Vue.component('vue-tree', VueTree)

new Vue({
  render: h => h(App),
}).$mount('#app')
