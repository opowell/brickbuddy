<script setup lang="ts">
import type { UiItem, UiListItem } from '../types'
const { list, parts } = defineProps({
  list: Object,
  parts: Array<UiItem>
})
const emits = defineEmits(['goHome', 'open', 'addItem', 'goItem', 'goShopLists'])
const newListItemItemId = ref('')
const newListItemCondition = ref('')
const newListItemMinQuantity = ref<number>(0)
const newListItemMaxQuantity = ref<number>(0)
const newListItemMaxPrice = ref<number>(0)
const newListItemColors = ref<number | null>(null)

function addNewListItem() {
  if (!list) {
    return
  }
  emits('addItem', {
    listId: list.id,
    itemId: newListItemItemId.value,
    condition: newListItemCondition.value,
    minQ: newListItemMinQuantity.value,
    maxQ: newListItemMaxQuantity.value,
    maxP: newListItemMaxPrice.value,
    colors: newListItemColors.value,
  })
}
function getColorNames(item: UiListItem) {
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
  const lowCaseFilter = filterString.value.toLowerCase()
  const lowCaseIdFilter = String(newListItemItemId.value).toLowerCase()
  return sortedParts.value.filter(a => {
    return (
      a.itemName.toLowerCase().includes(lowCaseFilter)
      && String(a.itemId).toLowerCase().includes(lowCaseIdFilter)
    )
  })
})
const partsView = ref('images')
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
    <h4>Parts ({{ list.items.length }})</h4>
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
    <h4>Add</h4>
    <div>
      View parts:
      <button @click="partsView = 'images'" :disabled="partsView === 'images'">Images</button>
      <button @click="partsView = 'table'" :disabled="partsView === 'table'">Table</button>
    </div>
    <div>Item name:<input v-model="filterString"></div>
    <div>Item Id:<input v-model="newListItemItemId" type="text"></div>
    <div>
      Condition:<select v-model="newListItemCondition">
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
    <div>Min quantity:<input v-model="newListItemMinQuantity" type="number"></div>
    <div>Max quantity:<input v-model="newListItemMaxQuantity" type="number"></div>
    <div>Max price:<input v-model="newListItemMaxPrice" type="number"></div>
    <div>Colors:<input v-model="newListItemColors" type="number"></div>
    <button @click="addNewListItem">
      Add
    </button>
    <div v-if="partsView === 'images'" class="parts">
      <template v-if="filteredParts.length === 1">
        <div v-for="variant in filteredParts[0].variants" :key="variant.colorId" class="part">
          <img @click="newListItemColors = variant.colorId" :src="variant.image" :title="variant.color.name + ' (' + variant.colorId + ')'">
          <span>{{ variant.colorId }}</span>
        </div>
      </template>
      <div
        v-else
        v-for="item in filteredParts"
        :key="item.itemId"
        class="part"
      >
        <img @click="newListItemItemId = item.itemId" v-if="item.variants.length" :src="item.variants[0].image" :title="item.itemName + ' (' + item.itemId + ')'">
        <span>{{ item.itemId }}</span>
        <span>{{ item.itemName }}</span>
      </div>
    </div>
    <table v-if="partsView === 'table'">
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
          <td>{{ item.categoryId }}</td>
          <td>{{ item.variants.length }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<style lang="css">
.parts {
  display: flex;
  flex-wrap: wrap;
}
.part {
  display: flex;
  flex-direction: column;
  flex: 0 0 100px;
  font-size: 0px;
}
</style>