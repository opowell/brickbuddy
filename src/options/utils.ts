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
