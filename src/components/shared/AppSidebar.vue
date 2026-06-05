<template>
  <nav class="app-sidebar" :class="{ 'sidebar-open': drawerOpen }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <img src="@/assets/images/a-punt-media-logo-blanco.png" class="logo-image" alt="À Punt Mèdia" />
    </div>

    <div class="sidebar-divider" />

    <!-- Nav principal: Contribucions -->
    <div class="sidebar-section-label">Contribucions</div>
    <router-link to="/contribucions" class="nav-item" :class="{ active: $route.path === '/contribucions' }" @click="tancarDrawer">
      <v-icon size="18">mdi-format-list-bulleted</v-icon>
      Totes les contribucions
    </router-link>
    <router-link to="/contribucions/nova" class="nav-item" :class="{ active: $route.path === '/contribucions/nova' }" @click="tancarDrawer">
      <v-icon size="18">mdi-plus-circle-outline</v-icon>
      Nova contribució
    </router-link>

    <div class="sidebar-divider" />

    <!-- Nav: FTTH -->
    <div class="sidebar-section-label">Localitzacions FTTH</div>
    <router-link to="/ftth" class="nav-item" :class="{ active: $route.path === '/ftth' }" @click="tancarDrawer">
      <v-icon size="18">mdi-web</v-icon>
      Totes les FTTH
    </router-link>
    <router-link to="/ftth/nova" class="nav-item" :class="{ active: $route.path === '/ftth/nova' }" @click="tancarDrawer">
      <v-icon size="18">mdi-plus-circle-outline</v-icon>
      Nova FTTH
    </router-link>

    <div class="sidebar-divider" />

    <!-- Nav: Localització -->
    <div class="sidebar-section-label">Localització</div>
    <router-link
      to="/localitzacio"
      class="nav-item"
      :class="{ active: $route.path === '/localitzacio' }"
      @click="tancarDrawer"
    >
      <v-icon size="18">mdi-map-marker-multiple-outline</v-icon>
      Totes les localitzacions
    </router-link>
    <router-link
      to="/localitzacio/nova"
      class="nav-item"
      :class="{ active: $route.path === '/localitzacio/nova' }"
      @click="tancarDrawer"
    >
      <v-icon size="18">mdi-plus-circle-outline</v-icon>
      Nova localització
    </router-link>

    <div class="sidebar-divider" />

    <!-- Catàleg -->
    <div class="sidebar-section-label">Catàleg</div>
    <router-link to="/cataleg/equips" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/equips') }" @click="tancarDrawer">
      <v-icon size="18">mdi-server</v-icon>
      Equips
    </router-link>
    <router-link to="/cataleg/tipus-equip" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/tipus-equip') }" @click="tancarDrawer">
      <v-icon size="18">mdi-tag-multiple-outline</v-icon>
      Tipus d'equip
    </router-link>
    <router-link to="/cataleg/cct" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/cct') }" @click="tancarDrawer">
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

const props = defineProps({
  drawerOpen: { type: Boolean, default: false },
})

const emit = defineEmits(['tancar'])

function tancarDrawer() {
  emit('tancar')
}
</script>

<style scoped>
.app-sidebar {
  width: 260px;
  min-height: 100vh;
  background: #1A1A2E;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 300;
  border-right: 1px solid rgba(255,255,255,0.06);
  /* Transició per a mòbil */
  transition: transform 0.25s ease;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px 20px;
}

.logo-image {
  width: 80%;
  object-fit: contain;
  border-radius: 6px;
  flex-shrink: 0;
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

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  border-radius: 0;
  transition: all 0.15s;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
}

.nav-item.active {
  background: rgba(232,0,28,0.15);
  color: #fff;
  border-left-color: #E8001C;
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

/* En mòbil, el sidebar és ocult per defecte */
@media (max-width: 767px) {
  .app-sidebar {
    transform: translateX(-100%);
    top: 0;
  }

  .app-sidebar.sidebar-open {
    transform: translateX(0);
  }
}
</style>
