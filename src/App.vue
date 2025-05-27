<script setup>
import Sidebar from './components/Sidebar.vue';
import Header from './components/Header.vue';

</script>

<template>
  <Header></Header>
  <div class="flex h-screen">
    

    <div class="w-[290px]">
      <Sidebar></Sidebar>
    </div>    
    <div class=" w-full ml-[60px] mt-[20px]">
      <div class=" p-6">
        <router-view />
      </div>
    </div>
  </div>
</template>

