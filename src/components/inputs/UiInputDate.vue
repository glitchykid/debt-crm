<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <el-date-picker
    :model-value="modelValue"
    class="ui-input-date"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', String($event ?? ''))"
  />
</template>

<style scoped src="@/styles/components/ui-input-date.css"></style>
