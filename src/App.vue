<template>
  <v-app>
    <AppSidebar />
    <v-main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import AppSidebar from '@/components/shared/AppSidebar.vue'
</script>
