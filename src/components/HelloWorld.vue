<script setup lang="ts">
  defineProps<{ msg: string }>();
</script>

<template>
  <h1 class="hello-msg">{{ msg }}</h1>
</template>

<style scoped>
  .hello-msg {
    font-size: 2.5rem;
  }
</style>
