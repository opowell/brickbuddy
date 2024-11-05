<script setup lang="ts">
import type { UiItem, UiShopListItem } from '../types'
const { parts } = defineProps({
  list: Object,
  parts: Array<UiItem>
})
const emits = defineEmits(['goHome', 'open', 'addItem', 'goItem', 'goShopLists'])
const newShopListItemListId = ref<number>(-1)
const newShopListItemItemId = ref('')
const newShopListItemCondition = ref('')
const newShopListItemMinQuantity = ref<number>(0)
const newShopListItemMaxQuantity = ref<number>(0)
const newShopListItemMaxPrice = ref<number>(0)
const newShopListItemColors = ref<string>('')

function addNewShopListItem() {
  emits('addItem', {
    listId: newShopListItemListId.value,
    itemId: newShopListItemItemId.value,
    condition: newShopListItemCondition.value,
    minQ: newShopListItemMinQuantity.value,
    maxQ: newShopListItemMaxQuantity.value,
    maxP: newShopListItemMaxPrice.value,
    colors: newShopListItemColors.value,
  })
}
function getColorNames(item: UiShopListItem) {
  if (!item || !item.colorNames) {
    return item.colors
  }
  return item.colorNames.map(colorObj => colorObj.name).join(',')
}
const sortedParts = computed(() => {
  if (!parts) {
    return []
  }
  return parts.sort((a, b) => {
    return a.itemName > b.itemName ? 1 : -1
  })
})
const filterString = ref('')
const filteredParts = computed(() => {
  if (filterString.value === '') {
    return sortedParts.value
  }
  const lowCaseFilter = filterString.value.toLowerCase()
  return sortedParts.value.filter(a => a.itemName.toLowerCase().includes(lowCaseFilter))
})
</script>

<template>
  <div v-if="list">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goShopLists')">
      Shopping Lists
    </button>
    <h4>{{ list.name }}</h4>
    <h4>ShopList Items ({{ list.items.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Item</th>
          <th>Condition</th>
          <th>MinQ</th>
          <th>MaxQ</th>
          <th>MaxP</th>
          <th>Colors</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list.items" :key="`${ item.itemId }-${ item.condition }-${ item.colors}`">
          <td>{{ item.itemId }}</td>
          <td>
            <button @click="$emit('goItem', item.item)">
              {{ item.item?.itemName }}
            </button>
          </td>
          <td>{{ item.condition }}</td>
          <td>{{ item.minQuantity }}</td>
          <td>{{ item.maxQuantity }}</td>
          <td>{{ item.maxPrice }}</td>
          <td>{{ getColorNames(item) }}</td>
        </tr>
      </tbody>
    </table>
    <h4>Add shop list item</h4>
    <div>Item name:<input v-model="filterString"></div>
    <div>Item Id:<input v-model="newShopListItemItemId" type="text"></div>
    <div>
      Condition:<select v-model="newShopListItemCondition">
        <option value="New">
          New
        </option>
        <option value="Any">
          Any
        </option>
        <option value="Used">
          Used
        </option>
      </select>
    </div>
    <div>Min quantity:<input v-model="newShopListItemMinQuantity" type="number"></div>
    <div>Max quantity:<input v-model="newShopListItemMaxQuantity" type="number"></div>
    <div>Max price:<input v-model="newShopListItemMaxPrice" type="number"></div>
    <div>Colors:<input v-model="newShopListItemColors" type="text"></div>
    <button @click="addNewShopListItem">
      Add
    </button>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Id</th>
          <th>Name</th>
          <th>Category</th>
          <th>Colors</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredParts" :key="item.itemId">
          <td><img v-if="item.variants.length" :src="item.variants[0].image"></td>
          <td>{{ item.itemId }}</td>
          <td>
            <button @click="$emit('goItem', item)">
              {{ item.itemName }}
            </button>
          </td>
          <td>{{ item.categoryString }}</td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>