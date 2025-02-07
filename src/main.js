/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'
import router from './router'
import App from './App.vue'
import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { use } from 'echarts/core';
import ECharts from 'vue-echarts';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart,PieChart } from 'echarts/charts';
import { TooltipComponent, GridComponent,TitleComponent,LegendComponent } from 'echarts/components';
import VueLazyLoad from 'vue-lazyload'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)
const pinia=createPinia()
app.use(VueLazyLoad)
app.use(router)
app.use(pinia)
app.use(ElementPlus)
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  TooltipComponent,
  GridComponent,
  TitleComponent,
  LegendComponent
]);


app.component('v-chart', ECharts);
registerPlugins(app)
app.mount('#app')

// const app = createApp(App).use(router).mount('#app')





