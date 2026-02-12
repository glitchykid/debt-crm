<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  label?: string
}>()
</script>

<template>
  <el-button v-bind="$attrs" class="ui-btn-text-icon">
    <span class="ui-btn-text-icon__content">
      <el-icon><component :is="icon" /></el-icon>
      <span><slot>{{ label }}</slot></span>
    </span>
  </el-button>
</template>

<style scoped src="@/styles/components/ui-button-text-icon.css"></style>
