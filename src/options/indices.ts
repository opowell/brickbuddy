interface IndexDefinition {
  name: string
  keyPath: string | string[]
}
const indices: {
  PARTS_BY_CATEGORY: IndexDefinition
} = {
  PARTS_BY_CATEGORY: {
    name: 'partsByCategory',
    keyPath: 'categoryString'
  }
}

export default indices