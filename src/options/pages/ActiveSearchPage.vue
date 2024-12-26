<script setup lang="ts">
import HomeButton from "../components/HomeButton.vue";
import { getSearchPageSearch, setPriceScoreQuantity } from "../idb/searches";
import { ConditionPriceAdjustment, SearchFilter, SearchPageSearch } from "../types";
const search = ref<SearchPageSearch | undefined>(undefined);
const priceScoreQuantity = ref<number>(100);
const route = useRoute();
const conditionPriceAdjustmentValues = ref({
  New: 1,
  Used: 1,
});
const conditionPriceAdjustments = computed<ConditionPriceAdjustment[]>(() => {
  if (!search.value) {
    return [];
  }
  return [
    {
      searchId: search.value.id,
      condition: "New",
      adjustment: conditionPriceAdjustmentValues.value.New,
    },
    {
      searchId: search.value.id,
      condition: "Used",
      adjustment: conditionPriceAdjustmentValues.value.Used,
    },
  ];
});
onMounted(async () => {
  search.value = await getSearchPageSearch(route.params.id - 0);
  if (!search.value) {
    return;
  }
  priceScoreQuantity.value = search.value.priceScoreQuantity;
  search.value.conditionPriceAdjustments.forEach((adjustment) => {
    conditionPriceAdjustmentValues.value[adjustment.condition] = adjustment.adjustment;
  });
});
import NameIdLabel from "../components/NameIdLabel.vue";
import { liveObjectCache } from "../idb/idb";
import stores from "../idb/stores";
import { dbDelete, put } from "../idb/db";
function setConditionAdjustment(adjustment: ConditionPriceAdjustment) {
  put(liveObjectCache.db, stores.SEARCH_CONDITION_PRICE_ADJUSTMENTS, adjustment);
}
async function removeFilter(filter: SearchFilter, index: number) {
  await dbDelete(liveObjectCache.db, stores.SEARCH_FILTERS, [
    filter.searchId,
    filter.type,
    filter.objectId,
  ]);
  if (!search.value) {
    return;
  }
  search.value.filters?.splice(index, 1);
}
</script>

<template>
  <div v-if="search">
    <HomeButton />
    <h4>Search <NameIdLabel :id="search.id" :name="search.name" /></h4>
    <div>
      <div>
        Price score quantity: <input v-model="priceScoreQuantity" type="number" />
        <button @click="setPriceScoreQuantity(priceScoreQuantity)">Set</button>
      </div>
      <div>
        Condition price adjustments:
        <div v-for="adjustment in conditionPriceAdjustments" :key="adjustment.condition">
          {{ adjustment.condition }}:
          <input v-model="adjustment.adjustment" type="number" step="0.05" />
          <button @click="setConditionAdjustment(adjustment)">Set</button>
        </div>
      </div>
    </div>
    <h4 v-if="search.filters">Filters ({{ search.filters.length }})</h4>
    <table v-if="search.filters">
      <thead>
        <tr>
          <th>Status</th>
          <th>Type</th>
          <th>Object</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(filter, index) in search.filters"
          :key="filter.type + filter.objectId"
        >
          <td>{{ filter.isExcluded ? "Exclude" : "Include" }}</td>
          <td>{{ filter.type }}</td>
          <td>{{ filter.objectId }}</td>
          <td><button @click="removeFilter(filter, index)">Remove</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
