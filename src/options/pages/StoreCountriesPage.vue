<script setup lang="ts">
import { SearchFilter, StoreCountriesPageStoreCountry, StoreCountry } from "../types";
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
import stores from "../idb/stores";
import { dbDelete, put } from "../idb/db";

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
  dbDelete(liveObjectCache.db, stores.SEARCH_FILTERS, [
    search.id,
    "storeCountry",
    country.id,
  ]);
  country.excluded = false;
  country.included = false;
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
  put(liveObjectCache.db, stores.SEARCH_FILTERS, filter);
  country.excluded = isExcluded;
  country.included = !isExcluded;
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
