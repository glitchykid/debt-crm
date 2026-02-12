<script setup lang="ts">
import { ref } from 'vue'

const tableRef = ref()

function getSelectionRows(): Array<{ id?: string }> {
  return tableRef.value?.getSelectionRows?.() ?? []
}

function clearSelection(): void {
  tableRef.value?.clearSelection?.()
}

defineExpose({
  getSelectionRows,
  clearSelection,
})
</script>

<template>
  <el-table ref="tableRef" v-bind="$attrs" class="ui-table">
    <slot />
  </el-table>
</template>

<style scoped src="@/styles/components/ui-table.css"></style>
