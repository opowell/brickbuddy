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

