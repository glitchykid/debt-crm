<script setup lang="ts">
import UiCard from '@/components/common/UiCard.vue'

defineProps<{
  label: string
  value: string
}>()
</script>

<template>
  <UiCard shadow="hover" class="ui-stat-card">
    <div class="ui-stat-card__label">{{ label }}</div>
    <div class="ui-stat-card__value">{{ value }}</div>
  </UiCard>
</template>

<style scoped src="@/styles/components/ui-stat-card.css"></style>
