<script setup lang="ts">
import type { UiShopList } from '../constants';

const { lists, variant } = defineProps({
  variant: Object,
  lists: Array<UiShopList>
})
defineEmits(['goHome', 'goItems', 'goItem', 'goStore', 'addToList'])
const addToListId = ref<number | undefined>()
const addToListCondition = ref<string>('New')
const addToListMinQ = ref<number>(1)
const addToListMaxQ = ref<number>(100)
const addToListMaxP = ref<number>(0)

const addToListItem = computed(() => {
  console.log(variant)
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
</script>

<template>
  <div v-if="variant">
    <button @click="$emit('goHome')">
      Home
    </button>
    <button @click="$emit('goItems')">
      Items
    </button>
    <button @click="$emit('goItem')">
      {{ variant.item.itemName }}
    </button>
    <h4>{{ variant.color.name }}</h4>
    <img :src="`https:${variant.newThumb1Img}`">
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
    <div>Store items</div>
    <table>
      <thead>
        <tr>
          <th>Store</th>
          <th>Price</th>
          <th>Quantity</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(invItem, index) in variant.invItems" :key="index">
          <td>
            <button @click="$emit('goStore', invItem.store)">
              {{ invItem.store.name }}
            </button>
          </td>
          <td>{{ invItem.price }}</td>
          <td>{{ invItem.quantity }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>