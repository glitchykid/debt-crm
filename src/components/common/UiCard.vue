<template>
  <el-card v-bind="$attrs" class="ui-card">
    <template v-if="$slots.header" #header>
      <slot name="header" />
    </template>
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </el-card>
</template>

<style scoped src="@/styles/components/ui-card.css"></style>
