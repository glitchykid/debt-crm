<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <el-input
    :model-value="modelValue"
    class="ui-input-text"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', String($event ?? ''))"
  />
</template>

<style scoped src="@/styles/components/ui-input-text.css"></style>
