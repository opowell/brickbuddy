import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import App from './app.vue'
import routes from './routes'
import './index.scss'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
})

createApp(App).use(router).use(createPinia()).mount('#app')

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

async function startScrapingAlarm() {
  console.log('start scraping alarm')
  await chrome.alarms.create('scrapePrices', { periodInMinutes: 0.5 })
}

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return
  }

  // Create an alarm so we have something to look at in the demo
  startScrapingAlarm()
})
