<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status?: 'active' | 'in_dispute' | 'settled'
}>()

const tagType = computed(() => {
  if (props.status === 'active') return 'success'
  if (props.status === 'in_dispute') return 'warning'
  return 'info'
})
</script>

<template>
  <el-tag :type="tagType" class="ui-status-tag">
    <slot />
  </el-tag>
</template>

<style scoped src="@/styles/components/ui-status-tag.css"></style>
