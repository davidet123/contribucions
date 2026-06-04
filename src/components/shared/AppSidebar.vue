<template>
  <nav class="app-sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="@/assets/images/a-punt-media-logo-blanco.png" class="logo-image" alt="À Punt Mèdia" />
    </div>

    <div class="sidebar-divider" />

    <!-- Nav principal: Contribucions -->
    <div class="sidebar-section-label">Contribucions</div>
    <router-link to="/contribucions" class="nav-item" :class="{ active: $route.path === '/contribucions' }">
      <v-icon size="18">mdi-format-list-bulleted</v-icon>
      Totes les contribucions
    </router-link>
    <router-link to="/contribucions/nova" class="nav-item" :class="{ active: $route.path === '/contribucions/nova' }">
      <v-icon size="18">mdi-plus-circle-outline</v-icon>
      Nova contribució
    </router-link>

    <div class="sidebar-divider" />

    <!-- Nav: FTTH -->
    <div class="sidebar-section-label">Localitzacions FTTH</div>
    <router-link to="/ftth" class="nav-item" :class="{ active: $route.path === '/ftth' }">
      <v-icon size="18">mdi-web</v-icon>
      Totes les FTTH
    </router-link>
    <router-link to="/ftth/nova" class="nav-item" :class="{ active: $route.path === '/ftth/nova' }">
      <v-icon size="18">mdi-plus-circle-outline</v-icon>
      Nova FTTH
    </router-link>

    <div class="sidebar-divider" />

    <!-- Catàleg -->
    <div class="sidebar-section-label">Catàleg</div>
    <router-link to="/cataleg/equips" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/equips') }">
      <v-icon size="18">mdi-server</v-icon>
      Equips
    </router-link>
    <router-link to="/cataleg/tipus-equip" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/tipus-equip') }">
      <v-icon size="18">mdi-tag-multiple-outline</v-icon>
      Tipus d'equip
    </router-link>
    <router-link to="/cataleg/cct" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/cct') }">
      <v-icon size="18">mdi-television-play</v-icon>
      Recursos CCT
    </router-link>

    <!-- Spacer -->
    <div class="sidebar-spacer" />

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="sidebar-footer-text">À Mèdia · v1.0</div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const $route = useRoute()
</script>

<style scoped>
.app-sidebar {
  width: 260px;
  min-height: 100vh;
  background: #1A1A2E;
  position: fixed;
  left: 0; top: 0;
  display: flex;
  flex-direction: column;
  z-index: 100;
  border-right: 1px solid rgba(255,255,255,0.06);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
}

.logo-mark {
  width: 40px;
  height: 40px;
  background: #E8001C;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 20px;
  font-weight: 700;
  color: white;
  flex-shrink: 0;
}
.logo-image {
  width: 80%;
  object-fit: contain;
  border-radius: 6px;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.logo-main {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: white;
  letter-spacing: 0.05em;
}

.logo-sub {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.03em;
}

.sidebar-divider {
  height: 1px;
  background: rgba(255,255,255,0.07);
  margin: 8px 0;
}

.sidebar-section-label {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  padding: 12px 20px 4px;
}

.sidebar-spacer {
  flex: 1;
}

.sidebar-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255,255,255,0.07);
}

.sidebar-footer-text {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
  font-family: 'DM Mono', monospace;
}
</style>