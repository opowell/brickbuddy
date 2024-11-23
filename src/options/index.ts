import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router/auto'
import App from './app.vue'
import routes from './routes'
// import '../assets/base.scss'
import './index.scss'

// routes.push({
//   path: '/',
//   redirect: '/options',
// })

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
  await chrome.alarms.create('scrapePrices', { periodInMinutes: 0.5 });
}

chrome.alarms.onAlarm.addListener(() => {
  console.log('fire alarm')
});

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return;
  }

  // Create an alarm so we have something to look at in the demo
  startScrapingAlarm()
});

// startScrapingAlarm()
// const STORAGE_KEY = "scrape-prices-alarm";

// async function checkAlarmState() {
//   const { alarmEnabled } = await chrome.storage.get(STORAGE_KEY);

//   if (alarmEnabled) {
//     const alarm = await chrome.alarms.get("my-alarm");

//     if (!alarm) {
//       await chrome.alarms.create({ periodInMinutes: 1 });
//     }
//   }
// }

// checkAlarmState();
