<script setup lang="ts">
import HomeButton from '../components/HomeButton.vue';
import PartsButton from '../components/PartsButton.vue';
import PartButton from '../components/PartButton.vue';
import { ActiveSearch, UiShopList, VariantPageVariant, type UiItemVariant } from '../types'
import { getVariantPageVariant } from '../idb/variants';
import { getActiveSearch } from '../idb/searches';
import StoreItemsTable from '../components/StoreItemsTable.vue';
import ActiveCartButton from '../components/ActiveCartButton.vue';

const addToListId = ref<number | undefined>()
const addToListCondition = ref<string>('New')
const addToListMinQ = ref<number>(1)
const addToListMaxQ = ref<number>(100)
const addToListMaxP = ref<number>(0)

import { useRoute } from 'vue-router'
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
const route = useRoute()

const variant = ref<VariantPageVariant | undefined>(undefined)
const lists = ref<UiShopList[] | undefined>(undefined)
const search = ref<ActiveSearch | undefined>(undefined)
onMounted(async () => {
  variant.value = await getVariantPageVariant(route.params.partId, route.params.colorId)
  search.value = getActiveSearch()
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
const cartButton = ref<typeof ActiveCartButton | undefined>(undefined)
function refreshCartButton() {
  if (cartButton.value) {
    cartButton.value.refresh()
  }
}
</script>

<template>
  <div v-if="variant && variant.item">
    <PartsButton />
    <PartButton :part="variant.item" />
    <ActiveCartButton ref="cartButton" />
    <h4>{{ variant.item.itemName }}, {{ variant.color.name }}</h4>
    <img :src="variant.image" />
    <h4>Add to shopping list</h4>
    <div>
      List:<select v-model="addToListId">
        <option v-for="list in lists" :key="list.id" :value="list.id">
          {{ list.name }}
        </option>
      </select>
      <div v-if="search && search.conditions.excluded.length < 1">
        Condition:<select v-model="addToListCondition">
          <option value="New">New</option>
          <option value="Any">Any</option>
          <option value="Used">Used</option>
        </select>
      </div>
      <div>Min quantity:<input v-model="addToListMinQ" type="number" /></div>
      <div>Max quantity:<input v-model="addToListMaxQ" type="number" /></div>
      <div>Max price:<input v-model="addToListMaxP" type="number" /></div>
    </div>
    <button @click="$emit('addToList', addToListItem)">Add</button>
    <StoreItemsTable
      :items="variant.invItems"
      hide-variant
      @refresh-cart-button="refreshCartButton"
    />
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
        <tr v-for="(shopListItem, index) in variant.listItems" :key="index">
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
