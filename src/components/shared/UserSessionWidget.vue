<template>
  <div class="session-widget">
    <!-- Sense sessió -->
    <div v-if="!authStore.isAuthenticated" class="session-login" @click="mostrarLogin = true">
      <v-icon size="18">mdi-login-variant</v-icon>
      Iniciar sessió
    </div>

    <!-- Amb sessió -->
    <div v-else class="session-user">
      <div class="session-avatar">{{ inicial }}</div>
      <div class="session-info">
        <span class="session-nom">{{ nomVisible }}</span>
        <span class="session-rol">{{ rolVisible }}</span>
      </div>
      <v-btn
        icon
        size="small"
        variant="text"
        class="session-logout"
        title="Tancar sessió"
        @click="authStore.logout()"
      >
        <v-icon size="18">mdi-logout-variant</v-icon>
      </v-btn>
    </div>

    <LoginDialog v-model="mostrarLogin" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoginDialog from '@/components/shared/LoginDialog.vue'

const authStore = useAuthStore()
const mostrarLogin = ref(false)

const ROLS_LABEL = {
  admin: 'Admin',
  enginyer: 'Enginyer',
  tècnic: 'Tècnic',
}

const nomVisible = computed(() => authStore.nom || authStore.user?.email || 'Usuari')

const rolVisible = computed(() => ROLS_LABEL[authStore.rol] || 'Sense rol')

const inicial = computed(() => {
  const base = authStore.nom || authStore.user?.email || '?'
  return base.trim().charAt(0).toUpperCase()
})
</script>

<style scoped>
.session-widget {
  padding: 4px 12px 8px;
}

.session-login {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
  color: rgba(255,255,255,0.6);
  cursor: pointer;
  border-radius: 8px;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.15s;
}

.session-login:hover {
  background: rgba(255,255,255,0.07);
  color: rgba(255,255,255,0.9);
}

.session-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 8px;
  border-radius: 8px;
}

.session-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: #E8001C;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.session-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0px;
}

.session-nom {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255,255,255,0.9);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.session-rol {
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  color: rgba(255,255,255,0.4);
}

.session-logout {
  color: rgba(255,255,255,0.5) !important;
  flex-shrink: 0;
}

.session-logout:hover {
  color: rgba(255,255,255,0.9) !important;
}
</style>
