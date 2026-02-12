<script setup lang="ts">
defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <el-input-number
    :model-value="modelValue"
    class="ui-input-number"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', Number($event ?? 0))"
  />
</template>

<style scoped src="@/styles/components/ui-input-number.css"></style>
