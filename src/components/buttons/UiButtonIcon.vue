<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
}>()
</script>

<template>
  <el-button v-bind="$attrs" class="ui-btn-icon">
    <el-icon><component :is="icon" /></el-icon>
  </el-button>
</template>

<style scoped src="@/styles/components/ui-button-icon.css"></style>
