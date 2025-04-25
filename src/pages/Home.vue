<script setup>
// @ is an alias to `src`. It's better going down the tree than walking up with `../../..`
import { useApi } from '@/composables/api'
const $api = useApi()
async function loadUrls() {
  // Thanks to ofetch, no need to do `await (await fetch()).json()` !
  const data = await $api("/rest/v3/short-urls")
  console.log(data)
}
</script>

<template>
    <h1>Hello word</h1>
    <button @click="loadUrls">Click</button>
</template>