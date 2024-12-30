<script setup lang="ts">
import HomeButton from "../components/HomeButton.vue";
import PartsButton from "../components/PartsButton.vue";
import PartVariantButton from "../components/PartVariantButton.vue";
import type {
  ExternalPartPageExternalPart,
  ExternalPartPageItemVariant,
  InvItem,
  PartPageVariant,
  PartPageVariantInvItem,
} from "../types";
import ActiveSearchButton from "../components/ActiveSearchButton.vue";
import { formatInteger, reportTime, startTimer } from "../utils";
import ActiveCartButton from "../components/ActiveCartButton.vue";
import StoreItemsTable from "../components/StoreItemsTable.vue";
interface VariantWithPriceQuantity extends PartPageVariant {
  price: number;
  maxPrice: number;
  quantity: number;
}
import { useRoute } from "vue-router";
import ColorButton from "../components/ColorButton.vue";
import { liveObjectCache } from "../idb/idb";
import ExternalCategoryButton from "../components/ExternalCategoryButton.vue";
startTimer("ExternalPartPage");
const route = useRoute();

const item = ref<ExternalPartPageExternalPart | undefined>();
const conditionsMap = ref();
onMounted(async () => {
  item.value = await liveObjectCache.getExternalPartPageExternalPart(
    route.params.type,
    route.params.id
  );
  const search = await liveObjectCache.getActiveSearch();
  conditionsMap.value = await liveObjectCache.getConditionsMap(search.id);
  reportTime("ExternalPartPage");
});
const maxPrice = ref<number | undefined>(Number.POSITIVE_INFINITY);
const minQuantity = ref();
const maxQuantity = ref();
const variants = computed<VariantWithPriceQuantity[]>(() => {
  const itemValue = item.value;
  if (!itemValue) {
    return [];
  }
  const variantsWithPQ: VariantWithPriceQuantity[] = itemValue.variants.map(
    (variant: ExternalPartPageItemVariant) => {
      let price = Number.POSITIVE_INFINITY;
      let varMaxPrice = 0;
      let quantity = 0;
      const matchingInvItems = itemValue.invItems.filter(
        (iv) => iv.colorId === variant.colorId
      );
      matchingInvItems.forEach((invItem: InvItem) => {
        if (condition.value !== "Any" && invItem.condition !== condition.value) {
          return;
        }
        const priceNumber = Number.parseFloat(invItem.price);
        if (maxPrice.value && maxPrice.value !== 0 && maxPrice.value < priceNumber) {
          return;
        }
        if (minQuantity.value === undefined || invItem.quantity >= minQuantity.value) {
          if (priceNumber < price) {
            price = priceNumber;
          }
          if (priceNumber > varMaxPrice) {
            varMaxPrice = priceNumber;
          }
        }
        if (!maxPrice.value || priceNumber <= maxPrice.value) {
          quantity += invItem.quantity;
        }
      });
      return {
        ...variant,
        price,
        maxPrice: varMaxPrice,
        quantity,
        invItems: matchingInvItems,
      };
    }
  );
  return variantsWithPQ
    .filter((variant: VariantWithPriceQuantity) => {
      return variant.price < Number.POSITIVE_INFINITY && variant.quantity > 0;
    })
    .sort(
      (a: VariantWithPriceQuantity, b: VariantWithPriceQuantity) => a.price - b.price
    );
});
const condition = ref<string>("New");
const invItems = computed<PartPageVariantInvItem[] | undefined>(() => {
  const itemValue = item.value;
  if (!itemValue) {
    return [];
  }
  return itemValue.variants.flatMap((variant) => {
    return itemValue.invItems
      .filter((ii) => ii.colorId === variant.colorId)
      .map((invItem) => {
        let adjustment = 1;
        if (conditionsMap.value) {
          adjustment = conditionsMap.value.get(invItem.condition);
        }
        return {
          ...invItem,
          price: Number.parseFloat(invItem.price) * adjustment,
          variant,
        };
      });
  });
});
const cartButton = ref<typeof ActiveCartButton | undefined>(undefined);
function refreshCartButton() {
  if (cartButton.value) {
    cartButton.value.refresh();
  }
}
function setCartQuantity({
  invItem,
  newQuantity,
}: {
  invItem: InvItem;
  newQuantity: number;
}) {
  const originalItem = item.value?.variants
    .flatMap((v) => item.value?.invItems)
    .find((i) => {
      if (!i) {
        return false;
      }
      return i.invId === invItem.invId && i.storeId === invItem.storeId;
    });
  if (!originalItem) {
    return;
  }
  originalItem.cartQuantity = newQuantity;
}
enum SORTINGS {
  InvItems,
  Colors,
}
const sorting = ref();
function sortByInvItems() {
  sorting.value = SORTINGS.InvItems;
}
</script>

<template>
  <div v-if="!item">Loading...</div>
  <div v-else>
    <ActiveCartButton ref="cartButton" />
    <HomeButton />
    <PartsButton />
    <h4>External Item {{ item.name }}</h4>
    <div>Item: {{ item.itemId }}</div>
    <div>External Category: <ExternalCategoryButton :category="item.category" /></div>
    <div>
      Quantity: <input v-model="minQuantity" type="number" /> -
      <input v-model="maxQuantity" type="number" />
    </div>
    <div>Max price:<input v-model="maxPrice" type="number" /></div>
    <div>
      Condition:<select v-model="condition">
        <option value="New">New</option>
        <option value="Any">Any</option>
        <option value="Used">Used</option>
      </select>
    </div>
    <h4>Variants ({{ variants.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Image</th>
          <th>Color</th>
          <th>Price</th>
          <th>Quantity</th>
          <th><button @click="sortByInvItems">Store Items</button></th>
          <th>Lists</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(variant, index) in variants" :key="index">
          <td>
            <PartVariantButton :part="item" :variant="variant">
              <img :src="variant.image" />
            </PartVariantButton>
          </td>
          <td>
            <ColorButton :color="variant.color" />
          </td>
          <td v-if="variant.price === variant.maxPrice">{{ variant.price }}</td>
          <td v-else>{{ variant.price }}&nbsp;-&nbsp;{{ variant.maxPrice }}</td>
          <td>{{ formatInteger(variant.quantity) }}</td>
          <td>{{ formatInteger(variant.invItems.length) }}</td>
          <td>Set quantity</td>
        </tr>
      </tbody>
    </table>
    <StoreItemsTable
      v-if="invItems"
      :items="invItems"
      show-color
      @set-cart-quantity="setCartQuantity"
      @refresh-cart-button="refreshCartButton"
    />
  </div>
</template>
