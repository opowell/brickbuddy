import * as math from "mathjs"

export async function toDataURL(url: string): Promise<string> {
  return new Promise(resolve => {
    var xhr = new XMLHttpRequest()
    xhr.onload = function() {
      var reader = new FileReader()
      reader.onloadend = function() {
        resolve(reader.result)
      }
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  })
}

export async function getUsage() {
  if (!navigator.storage || !navigator.storage.estimate) {
    return
  }
  const quota = await navigator.storage.estimate();
  if (!quota.usage || !quota.quota) {
    return
  }
  const percentageUsed = (quota.usage / quota.quota) * 100;
  console.log(`You've used ${percentageUsed}% of the available storage.`);
  const remaining = (quota.quota - quota.usage)/1024/1024/1024;
  console.log(`You can write up to ${remaining} more GB.`);
  return quota
}

export function formatFloat(x: number) {
  if (x === 0) {
    return 0
  }
  if (x < 1) {
    return x.toFixed(2)
  }
  if (x < 10) {
    return x.toFixed(1)
  }
  if (x < 1000) {
    return x.toFixed(0)
  }
  if (x < 10000) {
    return (x/1000).toFixed(1) + 'k'
  }
  if (x < 1000000) {
    return (x/1000).toFixed(0) + 'k'
  }
  return (x/1000000).toFixed(1) + 'm'
}
export function formatAmount(x: number) {
  if (typeof x !== 'number') {
    x = Number.parseFloat(x)
    if (Number.isNaN(x)) {
      console.warn('not number, returning', x)
      return x
    }
  }
  if (x === 0) {
    return 0
  }
  if (x < 10) {
    return x.toFixed(2)
  }
  if (x < 1000) {
    return x.toFixed(1)
  }
  if (x < 1000000) {
    return (x/1000).toFixed(1) + 'k'
  }
  return (x/1000000).toFixed(1) + 'm'
}
export function formatInteger(x: number) {
  if (x < 1000) {
    return x
  }
  if (x < 10000) {
    return (x/1000).toFixed(1) + 'k'
  }
  if (x < 1000000) {
    return (x/1000).toFixed(0) + 'k'
  }
  return (x/1000000).toFixed(1) + 'm'
}

export function cheapestPrice(
  items: { price: number | string, quantity: number }[],
  targetQ: number,
  sort: boolean = false
) {
  let sortedItems = items
  if (sort) {
    sortedItems = items.sort((a, b) => {
      return (
        (typeof a.price === 'number' ? a.price : Number.parseInt(a.price)) -
        (typeof b.price === 'number' ? b.price : Number.parseInt(b.price))
      )
    })
  }
  let cost = 0
  let quantity = 0
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i]
    const toTake = Math.min(item.quantity, targetQ - quantity)
    const price = typeof item.price === 'number' ? item.price : Number.parseFloat(item.price)
    try {
      quantity += toTake
      cost += price * toTake
    } catch (e) {
      console.log(e)
    }
    if (toTake >= targetQ) {
      break
    }
  }
  return cost / quantity
}

export function addHours(date: Date, hours: number) {
  date.setTime(date.getTime() + (hours*60*60*1000))
}

let timeStart = new Map<string, number>()
export function startTimer(x: string) {
  timeStart.set(x, new Date().getTime())
}

export function reportTime(x: string) {
  const start = timeStart.get(x)
  if (!start) {
    console.log('no timer started for', x)
    return
  }
  console.log(x, new Date().getTime() - start)
}

export function getScore(
  items: { price: number | string, quantity: number }[],
  targetQ: number,
  actualPrice: number | string,
  sort: boolean = false,
  cheapP?: number
) {
  if (cheapP === undefined) {
    cheapP = cheapestPrice(items, targetQ, sort)
  }
  const priceScore = math.divide(math.bignumber(actualPrice), math.bignumber(cheapP))
  const percent = math.multiply(100, math.subtract(priceScore, 1))
  let sign = ''
  if (math.larger(percent, 0)) {
    sign = '+'
  }
  // @ts-ignore
  return sign + math.round(percent, 2) + '%'
}
