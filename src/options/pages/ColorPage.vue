<script setup lang="ts">
import ColorsButton from "../components/ColorsButton.vue";
import HomeButton from "../components/HomeButton.vue";
import PartButton from "../components/PartButton.vue";
import { getColorPageColor } from "../idb/colors";
import { formatAmount } from "../utils";
import { useRoute } from "vue-router";
import { ColorPageColor, ColorPageInvItem } from "../types";
import StoreButton from "../components/StoreButton.vue";
import NameIdLabel from "../components/NameIdLabel.vue";
const route = useRoute();
const color = ref<ColorPageColor | undefined>(undefined);
onMounted(async () => {
  color.value = await getColorPageColor(route.params.id);
});
function getImageSrc(invItem: ColorPageInvItem) {
  const variant = invItem.variant;
  if (!variant) {
    return;
  }
  return variant.image;
}
</script>

<template>
  <div v-if="color">
    <HomeButton />
    <ColorsButton />
    <h4><NameIdLabel :name="color.name" :id="color.id" /></h4>
    <div>Lego: <NameIdLabel is-span :name="color.legoName" :id="color.legoId" /></div>
    <div>
      BrickLink:
      <NameIdLabel is-span :name="color.brickLinkName" :id="color.brickLinkId" />
    </div>
    <h4>Part variants</h4>
    <h4>Shop list items</h4>
    <h4>Inventory items ({{ color.invItems?.length }})</h4>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Name</th>
          <th>Condition</th>
          <th>Store</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in color.invItems" :key="item.invId">
          <td><img :src="getImageSrc(item)" /></td>
          <td>
            <PartButton :part="item.item" />
          </td>
          <td>{{ item.condition }}</td>
          <td><StoreButton :store="item.store" /></td>
          <td>{{ item.quantity }}</td>
          <td>
            {{
              formatAmount(
                item.store ? (item.price * item.store.priceAdjustment) / 100 : item.price
              )
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
