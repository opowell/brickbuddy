export function onlyUnique(value: any, index: number, array: any[]) {
  return array.indexOf(value) === index;
}

export function sum(array: any[], getValue: Function) {
  return array.reduce((accumulator, currentValue) => {
    return accumulator + getValue(currentValue)
  }, 0)
}

