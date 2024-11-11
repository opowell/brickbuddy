<script setup lang="ts">
import ExcludeConditionButton from '../components/ExcludeConditionButton.vue';
const conditions = ref<ConditionsPageCondition[] | undefined>(undefined)
function excludeCondition(index: number) {
  conditions.value?.splice(index, 1)
}
const search = ref<ActiveSearch | undefined>(undefined)
onMounted(async () => {
  conditions.value = await getConditionsPageConditions()
  search.value = await getActiveSearch()
})
const availableConditions = computed(() => {
  if (!conditions.value) {
    return []
  }
  return conditions.value.filter((condition) => {
    if (!search.value) {
      return true
    }
    if (search.value.conditions.ids.length === 0) {
      return true
    }
    if (search.value.conditions.excluded) {
      return !search.value.conditions.ids.includes(condition.id)
    }
    return search.value.conditions.ids.includes(condition.id)
  })
})
import ActiveSearchButton from '../components/ActiveSearchButton.vue';
import ConditionButton from '../components/ConditionButton.vue';
import HomeButton from '../components/HomeButton.vue';
import { getActiveSearch, getConditionsPageConditions } from '../idb';
import { ActiveSearch, ConditionsPageCondition } from '../types';
</script>

<template>
  <div>
    <HomeButton />
    <ActiveSearchButton />
    <h4>Conditions {{ '(' + availableConditions.length + ')' }}</h4>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Inventory Items</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(condition, index) in availableConditions" :key="condition.id">
          <td>
            <ConditionButton :condition="condition.id" />
          </td>
          <td>
            {{ condition.numInvItems }}
          </td>
          <td>
            <ExcludeConditionButton :condition="condition.id" @exclude="excludeCondition(index)"/>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>