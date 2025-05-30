<script setup>
import logo from "../assets/logo.png"
import archives from './../assets/archives.svg'
import link from './../assets/link.svg'
</script>

<template>
    <div class="w-[290px] h-full fixed flex flex-col top-0 left-0 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r-2 border-cyan-400/30 z-[99999] shadow-2xl shadow-cyan-400/10">
        <div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-cyan-400 via-purple-500 to-cyan-400 opacity-60 animate-pulse">
        </div>      
        <div class="p-6 pt-20">
            <div class="mb-8 text-center">
                <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/30">
                    <img class="text-2xl font-bold text-white font-[Orbitron]" :src="logo" />
                </div>
                <h2 class="text-lg font-[Orbitron] font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    NEXUS CORE
                </h2>
            </div>
            <nav class="space-y-3">
                <router-link 
                    to="/home" 
                    class="group flex items-center p-4 font-[Orbitron] font-semibold text-gray-300 rounded-lg border border-gray-700/50 hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-purple-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20"
                    active-class="bg-gradient-to-r from-cyan-400/20 to-purple-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-400/30"
                >
                    <img class="mr-3 w-[18px]" :src="link" />
                    <span class="tracking-wider">GÉNÉRATION</span>
                    <div class="ml-auto w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                </router-link>        
                <router-link 
                    to="/list" 
                    class="group flex items-center p-4 font-[Orbitron] font-semibold text-gray-300 rounded-lg border border-gray-700/50 hover:border-cyan-400/50 hover:bg-gradient-to-r hover:from-cyan-400/10 hover:to-purple-500/10 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/20"
                    active-class="bg-gradient-to-r from-cyan-400/20 to-purple-500/20 border-cyan-400 text-cyan-300 shadow-lg shadow-cyan-400/30">
                    <img class="mr-3 w-[18px]" :src="archives" />
                    <span class="tracking-wider">ARCHIVES</span>
                    <div class="ml-auto w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                </router-link>
            </nav>
            <div class="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-[Orbitron] text-gray-400 tracking-wider">STATUS</span>
                    <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div class="text-xs font-[Orbitron] text-cyan-300">SYSTÈME OPÉRATIONNEL</div>
            </div>
            <div class="mt-4 text-center">
                <div class="text-xs font-[Orbitron] text-gray-500 tracking-wider">v2.077</div>
            </div>
        </div>
    </div>
</template>