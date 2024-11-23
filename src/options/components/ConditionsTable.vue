<script setup lang="ts">
interface ConditionsTableCondition {
  id: string
  image: string
  numInvItems: number
}
defineProps({
  conditions: Object as PropType<ConditionsTableCondition[]>
})
defineEmits([
  'remove'
])
import ConditionButton from '../components/ConditionButton.vue';
</script>

<template>
  <table>
    <thead>
      <tr>
        <th>Actions</th>
        <th>Name</th>
        <th>Inv. Items</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="condition in conditions" :key="condition.id">
        <td>
          <button>x</button>
        </td>
        <td>
          <ConditionButton :condition="condition.id" />
        </td>
        <td>
          {{ condition.numInvItems }}
        </td>
      </tr>
    </tbody>
  </table>
</template>