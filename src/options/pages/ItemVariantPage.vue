<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import PartsButton from '../components/PartsButton.vue';
import PartButton from '../components/PartButton.vue';
import { UiShopList, type UiInvItem, type UiItemVariant } from '../types'
import { getUiPartVariant } from '../idb';

defineEmits(['goHome', 'goItems', 'goItem', 'goStore', 'addToList', 'goShopList'])
const addToListId = ref<number | undefined>()
const addToListCondition = ref<string>('New')
const addToListMinQ = ref<number>(1)
const addToListMaxQ = ref<number>(100)
const addToListMaxP = ref<number>(0)

import { useRoute } from 'vue-router'
import StoreButton from '../components/StoreButton.vue';
const route = useRoute()

const variant = ref<UiItemVariant | undefined>(undefined)
const lists = ref<UiShopList[] | undefined>(undefined)
onMounted(async () => {
  variant.value = await getUiPartVariant(route.params.partId - 0, route.params.colorId - 0)
})

const addToListItem = computed(() => {
  if (!variant.value) {
    return
  }
  return {
    listId: addToListId.value,
    itemId: variant.value.item.itemId,
    condition: addToListCondition.value,
    minQ: addToListMinQ.value,
    maxQ: addToListMaxQ.value,
    maxP: addToListMaxP.value,
    color: variant.value.colorId
  }
})
watch(() => lists, () => {
  if (addToListId.value) {
    return
  }
  if (!lists.value || !lists.value.length) {
    return
  }
  addToListId.value = lists.value[0].id
}, {
  deep: true,
  immediate: true
})

const sortedInvItems = computed(() => {
  if (!variant.value) {
    return []
  }
  return variant.value.invItems.sort((a: UiInvItem, b: UiInvItem) => a.price - b.price)
})
</script>

<template>
  <div v-if="variant">
    <HomeButton />
    <PartsButton />
    <PartButton :part="variant.item" />
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
            <StoreButton :store="invItem.store" />
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