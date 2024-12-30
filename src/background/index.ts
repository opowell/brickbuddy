import {
  getDbConnection,
  liveObjectCache,
  loadLiveObjectCache,
} from '@/options/idb/idb'
import { getPrices } from '@/options/idb/scraping'

chrome.runtime.onInstalled.addListener(async (opt) => {
  if (opt.reason === 'install') {
    await chrome.storage.local.clear()

    chrome.tabs.create({
      active: true,
      url: chrome.runtime.getURL('src/setup/index.html?type=install'),
    })
  }
})

console.log('hello world from background')

self.onerror = function (message, source, lineno, colno, error) {
  console.info(
    `Error: ${message}\nSource: ${source}\nLine: ${lineno}\nColumn: ${colno}\nError object: ${error}`
  )
}

async function startScrapingAlarm() {
  console.log('start scraping alarm')
  await chrome.alarms.create('scrapePrices', { periodInMinutes: 0.5 })
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === SCRAPE_ALARM_NAME) {
    const db = await getDbConnection()
    await loadLiveObjectCache(db)
    console.log('fire alarm', alarm, db, liveObjectCache)
    getPrices()
  }
})

chrome.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason !== 'install') {
    return
  }

  // Create an alarm so we have something to look at in the demo
  startScrapingAlarm()
})

const SCRAPE_ALARM_NAME = 'scrapePrices'

async function checkAlarmState() {
  await chrome.alarms.clear(SCRAPE_ALARM_NAME)
  await chrome.alarms.create(SCRAPE_ALARM_NAME, { periodInMinutes: 0.5 })
  const alarm = await chrome.alarms.get(SCRAPE_ALARM_NAME)
  console.log(alarm)
}

checkAlarmState()

export {}
