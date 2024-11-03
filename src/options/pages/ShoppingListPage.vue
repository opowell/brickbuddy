<script setup lang="ts">
import type { UiShopList, UiShopListItem } from '../constants'
defineProps({
  list: Object
})
const emits = defineEmits(['goHome', 'open', 'addItem', 'goItem'])
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
</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
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
  </div>
</template>