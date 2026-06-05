<template>
  <v-app>
    <!-- Overlay fosc quan el drawer està obert en mòbil -->
    <div
      v-if="isMobile && drawerOpen"
      class="mobile-overlay"
      @click="drawerOpen = false"
    />

    <!-- Botó hamburguesa (només visible en mòbil) -->
    <div class="mobile-toolbar">
      <v-btn icon variant="text" @click="drawerOpen = !drawerOpen">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
      <span class="mobile-toolbar-title">À Mèdia</span>
    </div>

    <!-- Sidebar -->
    <AppSidebar :drawer-open="drawerOpen" @tancar="drawerOpen = false" />

    <!-- Contingut principal -->
    <v-main class="app-main" :class="{ 'mobile-main': isMobile }">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppSidebar from '@/components/shared/AppSidebar.vue'

const drawerOpen = ref(false)
const windowWidth = ref(window.innerWidth)

const isMobile = computed(() => windowWidth.value < 768)

const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (!isMobile.value) {
    drawerOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style>
/* Toolbar mòbil */
.mobile-toolbar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #1A1A2E;
  z-index: 200;
  padding: 0 16px;
  align-items: center;
  gap: 12px;
}

.mobile-toolbar .v-btn {
  color: white;
}

.mobile-toolbar-title {
  color: rgba(255,255,255,0.85);
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
}

/* Overlay fosc per tancar el sidebar */
.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 299;
}

/* Desktop (>768px) */
@media (min-width: 768px) {
  .app-main {
    margin-left: 260px;
    transition: margin-left 0.2s ease;
  }
}

/* Mòbil (<768px) */
@media (max-width: 767px) {
  .mobile-toolbar {
    display: flex;
  }

  .app-main {
    margin-left: 0 !important;
    padding-top: 56px;
  }
}

/* Transicions de ruta */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
