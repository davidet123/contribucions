<template>
  <nav class="app-sidebar" :class="{ 'sidebar-open': drawerOpen }">
    <!-- Zona amb scroll: logo + totes les seccions de navegació -->
    <div class="sidebar-scroll">
      <!-- Logo -->
      <div class="sidebar-logo">
        <img src="@/assets/images/a-punt-media-logo-blanco.png" class="logo-image" alt="À Punt Mèdia" />
      </div>

      <div class="sidebar-divider" />

      <!-- Inici -->
      <router-link to="/" class="nav-item" :class="{ active: $route.path === '/' }" @click="tancarDrawer">
        <v-icon size="18">mdi-home-outline</v-icon>
        Inici
      </router-link>

      <div class="sidebar-divider" />

      <!-- Nav: Retransmissions -->
      <div class="sidebar-section-label">Retransmissions</div>
      <router-link to="/retransmissions" class="nav-item" :class="{ active: $route.path === '/retransmissions' }" @click="tancarDrawer">
        <v-icon size="18">mdi-broadcast</v-icon>
        Totes les retransmissions
      </router-link>
      <router-link v-if="authStore.potEscriureTot" to="/retransmissions/nova" class="nav-item" :class="{ active: $route.path === '/retransmissions/nova' }" @click="tancarDrawer">
        <v-icon size="18">mdi-plus-circle-outline</v-icon>
        Nova retransmissió
      </router-link>

      <div class="sidebar-divider" />

      <!-- Nav principal: Contribucions -->
      <div class="sidebar-section-label">Contribucions</div>
      <router-link to="/contribucions" class="nav-item" :class="{ active: $route.path === '/contribucions' }" @click="tancarDrawer">
        <v-icon size="18">mdi-format-list-bulleted</v-icon>
        Totes les contribucions
      </router-link>
      <router-link v-if="authStore.potEscriureTot" to="/contribucions/nova" class="nav-item" :class="{ active: $route.path === '/contribucions/nova' }" @click="tancarDrawer">
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
      <router-link v-if="authStore.potEscriureFtth" to="/ftth/nova" class="nav-item" :class="{ active: $route.path === '/ftth/nova' }" @click="tancarDrawer">
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
        v-if="authStore.potEscriureTot"
        to="/localitzacio/nova"
        class="nav-item"
        :class="{ active: $route.path === '/localitzacio/nova' }"
        @click="tancarDrawer"
      >
        <v-icon size="18">mdi-plus-circle-outline</v-icon>
        Nova localització
      </router-link>

      <!-- Catàleg: només visible amb sessió iniciada (qualsevol rol) -->
      <template v-if="authStore.isAuthenticated">
        <div class="sidebar-divider" />
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
        <router-link to="/cataleg/instaladors" class="nav-item" :class="{ active: $route.path.startsWith('/cataleg/instaladors') }" @click="tancarDrawer">
          <v-icon size="18">mdi-account-hard-hat-outline</v-icon>
          Instal·ladors
        </router-link>
      </template>

      <!-- Admin -->
      <template v-if="authStore.esAdmin">
        <div class="sidebar-divider" />
        <div class="sidebar-section-label">Administració</div>
        <router-link to="/admin/usuaris" class="nav-item" :class="{ active: $route.path === '/admin/usuaris' }" @click="tancarDrawer">
          <v-icon size="18">mdi-account-cog-outline</v-icon>
          Crear usuari
        </router-link>
      </template>
    </div>

    <!-- Footer: sempre fixat a baix, fora de la zona amb scroll -->
    <div class="sidebar-footer">
      <UserSessionWidget />
      <div class="sidebar-footer-text">À Mèdia · v1.0.9</div>
    </div>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserSessionWidget from '@/components/shared/UserSessionWidget.vue'

const $route = useRoute()
const authStore = useAuthStore()

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
  /* Fallback per a navegadors sense suport de dvh */
  height: 100vh;
  /* iOS Safari calcula 100vh com si la barra d'eines estigués oculta, deixant
     el footer (logout) fora de l'àrea visible real mentre la barra és
     visible. 100dvh s'ajusta dinàmicament a l'àrea visible real. Els
     navegadors que no entenen dvh ignoren aquesta línia i es queden amb el
     100vh anterior. */
  height: 100dvh;
  background: #1A1A2E;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
  z-index: 300;
  border-right: 1px solid rgba(255,255,255,0.06);
  overflow: hidden;
  /* Transició per a mòbil */
  transition: transform 0.25s ease;
}

/* Única zona amb scroll intern: si el contingut de navegació supera l'alçada
   de la finestra, aquí apareix la barra de scroll, sense afectar el footer */
.sidebar-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
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

.sidebar-footer {
  flex-shrink: 0;
  /* El padding inferior suma l'alçada de la zona de gestos d'iOS (home
     indicator) perquè el botó de logout mai quede tapat ni dins d'aquesta
     franja reservada pel sistema. env() torna 0 en navegadors sense safe
     area, així que no afecta a la resta de dispositius. */
  padding: 8px 0 calc(12px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(255,255,255,0.07);
}

.sidebar-footer-text {
  font-size: 11px;
  color: rgba(255,255,255,0.2);
  font-family: 'DM Mono', monospace;
  padding: 4px 20px 0;
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