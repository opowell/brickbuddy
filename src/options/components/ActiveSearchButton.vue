<script setup lang="ts">
import { Crumbs } from "../idb/constants";
import { useRouter } from "vue-router";
import { ActiveSearchButtonActiveSearch } from "../types";
import { formatInteger } from "../utils";
import { getActiveSearchButtonActiveSearch } from "../idb/searches";
const router = useRouter();
const activeSearch = ref<ActiveSearchButtonActiveSearch | undefined>(undefined);
onMounted(async () => {
  activeSearch.value = await getActiveSearchButtonActiveSearch();
});
const showButton = computed(() => {
  if (!activeSearch.value) {
    return false;
  }
  return text.value.length > 0;
});
function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
const text = computed(() => {
  const search = activeSearch.value;
  if (!search) {
    return "";
  }
  const texts: string[] = [
    "Price score: quantity: " + formatInteger(search.priceScoreQuantity),
  ];
  if (search.priceScoreIgnoreColor) {
    texts.push("ignore color");
  }
  const fields = ["categories", "colors", "parts", "conditions", "countries", "stores"];
  fields.forEach((field) => {
    const searchField: { includedNames: string[]; excludedNames: string[] } =
      // @ts-ignore
      search[field];
    if (!searchField) {
      return;
    }
    if (
      searchField.includedNames.length === 0 &&
      searchField.excludedNames.length === 0
    ) {
      return;
    }
    if (searchField.includedNames.length > 0) {
      let searchText = searchField.includedNames.length + " " + field;
      if (searchField.excludedNames.length > 0) {
        searchText =
          searchField.includedNames.length +
          "-" +
          searchField.excludedNames.length +
          " " +
          field;
      }
      texts.push(searchText);
    } else {
      if (searchField.excludedNames.length > 0) {
        texts.push("-" + searchField.excludedNames.length + " " + field);
      }
    }
  });
  return "Search: " + texts.join("; ");
});
</script>

<template>
  <button
    v-if="activeSearch && showButton"
    @click="router.push(Crumbs.search(activeSearch.id).href)"
  >
    {{ text }}
  </button>
</template>
