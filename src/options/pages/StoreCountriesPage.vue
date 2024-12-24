<script setup lang="ts">
import { SearchFilter, Store, StoreCountriesPageStoreCountry } from "../types";
const storeCountries = ref<StoreCountriesPageStoreCountry[] | undefined>();
onMounted(async () => {
  storeCountries.value = await getStoreCountriesPageStoreCountries();
});

import HomeButton from "../components/HomeButton.vue";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import ActiveCartButton from "../components/ActiveCartButton.vue";
import { getStoreCountriesPageStoreCountries } from "../idb/storeCountries";
import { getActiveSearch } from "../idb/searches";
import { liveObjectCache } from "../idb/idb";
import STORES from "../idb/stores";
import { dbDelete, getAllFromIndex, put } from "../idb/db";
import indices from "../idb/indices";
import { BOOLEAN_AS_NUMBER } from "../idb/utils";

function include(country: StoreCountriesPageStoreCountry) {
  return filter(country, false);
}
function exclude(country: StoreCountriesPageStoreCountry) {
  return filter(country, true);
}
async function clear(country: StoreCountriesPageStoreCountry) {
  const search = await getActiveSearch();
  if (!search) {
    return;
  }
  dbDelete(liveObjectCache.db, STORES.SEARCH_FILTERS, [
    search.id,
    "storeCountry",
    country.id,
  ]);
  country.excluded = false;
  country.included = false;
  const stores = await getAllFromIndex<Store>(
    liveObjectCache.db,
    indices.STORES_BY_COUNTRY,
    country.id
  );
  if (!stores) {
    return;
  }
  for (let i = 0; i < stores.length; i++) {
    await dbDelete(liveObjectCache.db, STORES.SEARCH_STORES, [search.id, stores[i].id]);
  }
}
async function filter(country: StoreCountriesPageStoreCountry, isExcluded: boolean) {
  const search = await getActiveSearch();
  if (!search) {
    return;
  }
  const filter: SearchFilter = {
    searchId: search.id,
    type: "storeCountry",
    isExcluded,
    objectId: country.id,
  };
  put(liveObjectCache.db, STORES.SEARCH_FILTERS, filter);
  country.excluded = isExcluded;
  country.included = !isExcluded;
  const stores = await getAllFromIndex<Store>(
    liveObjectCache.db,
    indices.STORES_BY_COUNTRY,
    country.id
  );
  if (!stores) {
    return;
  }
  for (let i = 0; i < stores.length; i++) {
    await put(liveObjectCache.db, STORES.SEARCH_STORES, {
      searchId: search.id,
      storeId: stores[i].id,
      isExcluded: isExcluded ? BOOLEAN_AS_NUMBER.TRUE : BOOLEAN_AS_NUMBER.FALSE,
    });
  }
}
</script>

<template>
  <div>
    <HomeButton />
    <ActiveCartButton />
    <ActiveSearchButton />
    <h4 v-if="storeCountries">Store Countries ({{ storeCountries.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Name</th>
          <th>Stores</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="country in storeCountries" :key="country.id">
          <td>{{ country.id }}</td>
          <td>{{ country.name }}</td>
          <td>
            <button>{{ country.numStores }}</button>
          </td>
          <td>
            <button :disabled="country.included" @click="include(country)">
              Include
            </button>
            <button :disabled="country.excluded" @click="exclude(country)">
              Exclude
            </button>
            <button
              :disabled="!country.excluded && !country.included"
              @click="clear(country)"
            >
              Clear
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
