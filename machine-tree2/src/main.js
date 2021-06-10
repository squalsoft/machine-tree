import Vue from 'vue'
import App from './App.vue'
import VueTree from '@ssthouse/vue-tree-chart'
import vmodal from 'vue-js-modal'

Vue.config.productionTip = false

Vue.component('vue-tree', VueTree)
Vue.use(vmodal)

new Vue({
  render: h => h(App),
}).$mount('#app')
