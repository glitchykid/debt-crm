<script setup lang="ts">
defineProps<{
  modelValue: string | number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <el-select
    :model-value="modelValue"
    class="ui-select"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event as string | number)"
  >
    <slot />
  </el-select>
</template>

<style scoped src="@/styles/components/ui-select.css"></style>
