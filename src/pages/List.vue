<script setup>
import { ref } from 'vue';
import ListUrl from '@/components/ListUrl.vue';

</script>

<template>
  <div>
    <h1>Liste lien + nombre de vu</h1>
    <ListUrl :links="shortLinks" @delete-link="deleteShortLink" />
  </div>
</template>