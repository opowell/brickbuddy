<script setup lang="ts">
import type { UiShopList } from '../constants'
defineProps({
  list: Object
})
const emits = defineEmits(['goHome', 'open', 'addItem'])
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

</script>

<template>
  <div>
    <button @click="$emit('goHome')">
      Home
    </button>
    <h4>{{ list.name }}</h4>
    <!-- <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Items</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="list in lists" :key="list.id">
          <td>
            <button @click="$emit('open', list)">
              {{ list.name }}
            </button>
          </td>
          <td>
            {{ list.items }}
          </td>
        </tr>
      </tbody>
    </table> -->
    <!-- <h4>ShopList Items</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Condition</th>
          <th>MinQ</th>
          <th>MaxQ</th>
          <th>MaxP</th>
          <th>Colors</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in shopListItems" :key="`${item.shopListId }-${ item.itemId }-${ item.condition }-${ item.colors}`">
          <td>{{ item.itemId }}</td>
          <td>{{ item.condition }}</td>
          <td>{{ item.minQuantity }}</td>
          <td>{{ item.maxQuantity }}</td>
          <td>{{ item.maxPrice }}</td>
          <td>{{ item.colors }}</td>
        </tr>
      </tbody>
    </table> -->
    <h4>Add shop list item</h4>
    <div>Item Id:<input v-model="newShopListItemItemId" type="text"></div>
    <div>
      Condition:<select v-model="newShopListItemCondition">
        <option value="New">
          New
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