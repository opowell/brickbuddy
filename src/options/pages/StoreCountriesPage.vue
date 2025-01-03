<script setup lang="ts">
import { SearchFilter, Store, StoreCountriesPageStoreCountry } from "../types";
const storeCountries = ref<StoreCountriesPageStoreCountry[] | undefined>();
onMounted(async () => {
  storeCountries.value = await getStoreCountriesPageStoreCountries();
});

import { getStoreCountriesPageStoreCountries } from "../idb/storeCountries";
import { getActiveSearch } from "../idb/searches";
import { liveObjectCache } from "../idb/idb";
import STORES from "../idb/stores";
import { dbDelete, getAllFromIndex, put } from "../idb/db";
import indices from "../idb/indices";
import FilterButtons from "../components/FilterButtons.vue";
import CountryButton from "../components/CountryButton.vue";
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
}
</script>

<template>
  <div>
    <h4 v-if="storeCountries">Countries ({{ storeCountries.length }})</h4>
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
          <td>
            <CountryButton :country="country" />
          </td>
          <td>
            <button>{{ country.numStores }}</button>
          </td>
          <td>
            <FilterButtons
              :included="country.included"
              :excluded="country.excluded"
              @include="include(country)"
              @exclude="exclude(country)"
              @clear="clear(country)"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
