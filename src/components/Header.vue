<script setup>

</script>
<template>
    <header class="fixed top-0 flex w-full h-[60px] bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 border-b-2 border-cyan-400 z-[99999] shadow-lg shadow-cyan-400/20">
        <div class="flex items-center justify-between w-full px-6">
            <div class="flex items-center space-x-4">
                <div class="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
                </div>
                <h1 class="text-xl font-[Orbitron] font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    URL NEXUS
                </h1>
            </div>      
            <div class="flex items-center space-x-4">
                <div class="hidden md:flex items-center space-x-2 text-cyan-300 font-[Orbitron] text-sm">
                    <div class="animate-ping bg-red-400 h-2 w-2 rounded-full"></div>
                    <span class="text-red-400 animate-pulse">UTILISATEUR INCONNU</span>
                </div>
                
                <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-400 rounded-full flex items-center justify-center border-2 border-cyan-400/50">
                    <span class="text-white font-bold font-[Orbitron]">U</span>
                </div>
            </div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>
    </header>
</template>