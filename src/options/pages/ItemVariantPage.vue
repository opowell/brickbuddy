<script setup lang="ts">
import type { UiInvItem, UiShopList } from '../types'

const { lists, variant } = defineProps({
  variant: Object,
  lists: Array<UiShopList>
})
defineEmits(['goHome', 'goItems', 'goItem', 'goStore', 'addToList', 'goShopList'])
const addToListId = ref<number | undefined>()
const addToListCondition = ref<string>('New')
const addToListMinQ = ref<number>(1)
const addToListMaxQ = ref<number>(100)
const addToListMaxP = ref<number>(0)

const addToListItem = computed(() => {
  if (!variant) {
    return
  }
  return {
    listId: addToListId.value,
    itemId: variant.item.itemId,
    condition: addToListCondition.value,
    minQ: addToListMinQ.value,
    maxQ: addToListMaxQ.value,
    maxP: addToListMaxP.value,
    color: variant.colorId
  }
})
watch(() => lists, () => {
  if (addToListId.value) {
    return
  }
  if (!lists || !lists.length) {
    return
  }
  addToListId.value = lists[0].id
}, {
  deep: true,
  immediate: true
})

const sortedInvItems = computed(() => {
  if (!variant) {
    return []
  }
  return variant.invItems.sort((a: UiInvItem, b: UiInvItem) => a.price - b.price)
})
</script>

<template>
  <div v-if="variant">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goItems')">
      Parts
    </button>
    <button @click="$emit('goItem')">
      {{ variant.item.itemName }}
    </button>
    <h4>{{ variant.item.itemName }}, {{ variant.color.name }}</h4>
    <img :src="variant.image">
    <h4>Add to shopping list</h4>
    <div>
      List:<select v-model="addToListId">
        <option
          v-for="list in lists"
          :key="list.id"
          :value="list.id"
        >
          {{ list.name }}
        </option>
      </select>
      <div>
        Condition:<select v-model="addToListCondition">
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
      <div>Min quantity:<input v-model="addToListMinQ" type="number"></div>
      <div>Max quantity:<input v-model="addToListMaxQ" type="number"></div>
      <div>Max price:<input v-model="addToListMaxP" type="number"></div>
    </div>
    <button @click="$emit('addToList', addToListItem)">
      Add
    </button>
    <h4>Store items</h4>
    <table>
      <thead>
        <tr>
          <th>Store</th>
          <th>Condition</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(invItem, index) in sortedInvItems" :key="index">
          <td>
            <button @click="$emit('goStore', invItem.store)">
              {{ invItem.store.name }}
            </button>
          </td>
          <td>{{ invItem.condition }}</td>
          <td>{{ invItem.price }}</td>
          <td>{{ invItem.quantity }}</td>
        </tr>
      </tbody>
    </table>
    <h4>Shopping lists</h4>
    <table>
      <thead>
        <tr>
          <th>List</th>
          <th>MaxP</th>
          <th>MinQ</th>
          <th>MaxQ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(shopListItem, index) in variant.shopListItems" :key="index">
          <td>
            <button @click="$emit('goShopList', shopListItem.shopList)">
              {{ shopListItem.shopList.name }}
            </button>
          </td>
          <td>{{ shopListItem.maxP }}</td>
          <td>{{ shopListItem.minQ }}</td>
          <td>{{ shopListItem.maxQ }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>