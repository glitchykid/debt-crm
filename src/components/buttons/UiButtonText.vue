<script setup lang="ts">
defineProps<{
  label?: string
}>()
</script>

<template>
  <el-button v-bind="$attrs" class="ui-btn-text">
    <slot>{{ label }}</slot>
  </el-button>
</template>

<style scoped src="@/styles/components/ui-button-text.css"></style>
