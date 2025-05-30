<script setup>
import { ref } from 'vue';
import ListUrl from '@/components/ListUrl.vue';
import { useApi } from '@/composables/api';

const $api = useApi();

const shortLinks = ref([
  { slug: 'abc123', title: 'Lien 1', shortUrl: 'https://ex.com/abc123' },
  { slug: 'def456', title: 'Lien 2', shortUrl: 'https://ex.com/def456' }
]);

async function deleteShortLink(slugOrId) {
  if (!slugOrId) {
    alert("Aucun identifiant de lien fourni.");
    return;
  }
  try {
    await $api(`/rest/v3/short-urls/${slugOrId}`, {
      method: 'DELETE'
    });
    alert("Lien court supprimé avec succès.");
    shortLinks.value = shortLinks.value.filter(link => link.slug !== slugOrId);
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    alert("Erreur lors de la suppression du lien.");
  }
}
</script>

<template>
  <div>
    <ListUrl :links="shortLinks" @delete-link="deleteShortLink" />

  </div>
</template>