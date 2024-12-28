<script setup lang="ts">
import HomeButton from "../components/HomeButton.vue";
import StoresButton from "../components/StoresButton.vue";
import { ActiveSearch, StorePageInvItem, StorePageStore, StoreType } from "../types";
import { useRoute } from "vue-router";
import { getStorePrices } from "../idb/scraping";
import { getStorePageStore } from "../idb/storeMethods";
import { liveObjectCache } from "../idb/idb";
import FilterButtons from "../components/FilterButtons.vue";
import { setCartQuantity } from "../idb/carts";
import ExternalPartButton from "../components/ExternalPartButton.vue";
import ColorButton from "../components/ColorButton.vue";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import ActiveCartButton from "../components/ActiveCartButton.vue";
import { formatAmount, formatInteger, getScore } from "../utils";
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
import ConditionButton from "../components/ConditionButton.vue";
import PartVariantButton from "../components/PartVariantButton.vue";
import QuantityInput from "../components/QuantityInput.vue";
import { externalPartPriceMap } from "../idb/categories";
const route = useRoute();
const store = ref<StorePageStore | undefined>();
const search = ref<ActiveSearch | undefined>();
const mounted = ref(false);
onMounted(async () => {
  search.value = await liveObjectCache.getActiveSearch();
  store.value = await getStorePageStore(route.params.id, route.params.type);
  if (!store.value) {
    return;
  }
  mounted.value = true;
});

// URL for shipping terms:
// https://store.bricklink.com/ajax/clone/store/policy.ajax?sid=2066952

// URL for cart, includes weights:
// https://store.bricklink.com/ajax/clone/cart/list.ajax?sid=2066952&sum=0&_=1730928837742
const url = computed(() => {
  if (!store.value) {
    return;
  }
  if (store.value.type === StoreType.BrickLink) {
    return "https://store.bricklink.com/" + store.value.slug;
  }
  return store.value.slug;
});

async function updateCartQuantity(item: StorePageInvItem, newQuantity: number) {
  if (!store.value) {
    return;
  }
  const response = await setCartQuantity(
    store.value,
    item.invId,
    item.price,
    newQuantity
  );
  if (response) {
    item.cartQuantity = newQuantity;
  }
  if (cartButton.value) {
    cartButton.value.refresh();
  }
}

const cartButton = ref<typeof ActiveCartButton | undefined>(undefined);

enum SORTINGS {
  PRICE,
  NONE,
}
const sorting = ref(SORTINGS.NONE);
function sortByPrice() {
  sorting.value = SORTINGS.PRICE;
}

const sortedItems = computed(() => {
  if (!store.value) {
    return;
  }
  return store.value.items.sort((a, b) => {
    switch (sorting.value) {
      case SORTINGS.NONE:
        return 1;
      case SORTINGS.PRICE:
        return Number.parseFloat(a.price) - Number.parseFloat(b.price);
    }
  });
});
</script>

<template>
  <HomeButton />
  <StoresButton />
  <ActiveCartButton ref="cartButton" />
  <div v-if="store">
    <h4>{{ store.name }}</h4>
    <div><button @click="getStorePrices(store)">Scrape</button></div>
    <div>Search: <FilterButtons /></div>
    <div>Fetch index: {{ store.fetchPageIndex }} / {{ store.fetchMaxPageIndex }}</div>
    <div>Last scraped: {{ store.lastScraped.toISOString() }}</div>
    <div>Price adjustment: {{ store.priceAdjustment }}%</div>
    <div>Country: {{ store.countryId }}</div>
    <div>
      Link: <a target="_blank" :href="url">{{ url }}</a>
    </div>
    <template v-if="sortedItems">
      <h4>Inventory ({{ sortedItems.length }})</h4>
      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th>Name</th>
            <th v-if="search && search.conditions.excluded.length < 1">Condition</th>
            <th>Color</th>
            <th>Category</th>
            <th>Quantity</th>
            <th><button @click="sortByPrice">Price</button></th>
            <th>Price Score</th>
            <th>Cart</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invItem in store.items" :key="invItem.invId">
            <td>
              <PartVariantButton
                :part="liveObjectCache.storePageExternalParts.get(invItem.itemId)"
                :variant="
                  liveObjectCache.partVariantByPartColor.get(
                    invItem.itemId + invItem.colorId
                  )
                "
              >
                <img
                  v-if="
                    liveObjectCache.partVariantByPartColor.get(
                      invItem.itemId + invItem.colorId
                    )
                  "
                  :src="
                    liveObjectCache.partVariantByPartColor.get(
                      invItem.itemId + invItem.colorId
                    )?.image
                  "
                />
              </PartVariantButton>
            </td>
            <td>
              <ExternalPartButton
                v-if="liveObjectCache.storePageExternalParts.get(invItem.itemId)"
                :part="liveObjectCache.storePageExternalParts.get(invItem.itemId)"
              />
            </td>
            <td v-if="search && search.conditions.excluded.length < 1">
              <ConditionButton :condition="invItem.condition" />
            </td>
            <td><ColorButton :color="invItem.color" /></td>
            <td><ExternalCategoryButton :category="invItem.externalCategory" /></td>
            <td>{{ formatInteger(invItem.quantity) }}</td>
            <td>
              {{
                formatAmount(
                  (Number.parseFloat(invItem.price) * store.priceAdjustment) / 100
                )
              }}
            </td>
            <td>
              {{ formatAmount(externalPartPriceMap.get(invItem.type + invItem.itemId)) }}
            </td>
            <td>
              <QuantityInput
                :current="invItem.cartQuantity"
                :max="invItem.quantity"
                @update-quantity="updateCartQuantity(invItem, $event)"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
  <div v-else-if="mounted">Error loading page.</div>
  <div v-else>Loading...</div>
</template>

<style lang="css" scoped>
input {
  width: 70px;
}
</style>
