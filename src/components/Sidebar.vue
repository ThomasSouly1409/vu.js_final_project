<script setup>

</script>

<template>
    <div class="w-[290px] h-full fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 z-99999 border-r border-gray-200">
      <div class="p-4">
        <h2 class="font-bold mb-4">Navigation</h2>
        <nav class="space-y-2">
          <router-link 
            to="/home" 
            class="block p-2 mb-4 uppercase lg:text-gray-400 dark:text-black-400 rounded hover:bg-gray-300"
            active-class="dark:bg-gray-300"
          >
            Home
          </router-link>
          <router-link 
            to="/list" 
            class="block p-2 mb-4 uppercase lg:text-gray-400 dark:text-black-400 rounded hover:bg-gray-300"
            active-class="dark:bg-gray-300"
          >
            List
          </router-link>
          <router-link 
            to="/visitlist" 
            class="block p-2 mb-4 uppercase lg:text-gray-400 dark:text-black-400 rounded hover:bg-gray-300"
            active-class="dark:bg-gray-300"
          >
            Visit List
          </router-link>
        </nav>
      </div>
    </div>
</template>