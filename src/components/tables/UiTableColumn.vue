<script setup lang="ts">
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <el-table-column :resizable="false" v-bind="$attrs" class="ui-table-column">
    <template v-if="slots.default" #default="scope">
      <slot name="default" v-bind="scope" />
    </template>
    <template v-if="slots.header" #header="scope">
      <slot name="header" v-bind="scope" />
    </template>
  </el-table-column>
</template>

<style scoped src="@/styles/components/ui-table-column.css"></style>
