<script setup lang="ts">
import { Crumbs } from '../idb/constants';
import { useRouter } from 'vue-router'
import { ActiveCartButtonCart } from '../types';
import { getActiveCartButtonCart } from '../idb/carts';
import { formatAmount, formatInteger } from '../utils';

const router = useRouter()
const activeCart = ref<ActiveCartButtonCart | undefined>(undefined)
onMounted(async () => {
  refresh()
})
const showButton = computed(() => {
  if (!activeCart.value) {
    return false
  }
  return activeCart.value.totalItems > 0
})
const text = computed(() => {
  const cart = activeCart.value
  if (!cart) {
    return ''
  }
  return 'Cart: ' + formatInteger(cart.totalItems) + ' items, ' + formatInteger(cart.totalQuantity) + ' pcs., &euro; ' + formatAmount(cart.totalCost)
})
async function refresh() {
  activeCart.value = await getActiveCartButtonCart()
}
defineExpose({
  refresh
})
</script>

<template>
  <button v-if="activeCart && showButton" @click="router.push(Crumbs.activeCart.href)" v-html="text">
  </button>
</template>