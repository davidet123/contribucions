<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Contribucions</h1>
        <p class="page-subtitle">{{ llistaOrdenada.length }} document{{ llistaOrdenada.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/contribucions/nova')">
        Nova contribució
      </v-btn>
    </div>

    <!-- Search / filter bar -->
    <div class="filter-bar">
      <v-text-field
        v-model="cerca"
        prepend-inner-icon="mdi-magnify"
        placeholder="Cercar per nom, origen..."
        hide-details
        density="compact"
        style="max-width: 360px"
        bg-color="white"
      />
    </div>

    <!-- Empty state -->
    <div v-if="llistaFiltrada.length === 0" class="empty-state">
      <v-icon size="56" color="grey-lighten-2">mdi-file-document-outline</v-icon>
      <p class="empty-title">Cap contribució</p>
      <p class="empty-sub">Crea la primera contribució per començar</p>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/contribucions/nova')">
        Nova contribució
      </v-btn>
    </div>

    <!-- Grid -->
    <div v-else class="contribucions-grid">
      <div
        v-for="c in llistaFiltrada"
        :key="c.id"
        class="contribucio-card"
        @click="$router.push('/contribucions/' + c.id)"
      >
        <!-- Logo / imatge -->
        <div class="card-logo-area">
          <img v-if="getImatge(c.logoId)" :src="getImatge(c.logoId)" class="card-logo" alt="" />
          <div v-else class="card-logo-placeholder">
            <v-icon color="grey-lighten-2" size="28">mdi-television-play</v-icon>
          </div>
        </div>

        <!-- Info -->
        <div class="card-body">
          <div class="card-header-row">
            <span class="card-title">{{ c.nomPrograma || 'Sense títol' }}</span>
            <span class="versio-badge">v{{ c.versio }}</span>
          </div>
          <p v-if="c.subtitol" class="card-subtitol">{{ c.subtitol }}</p>
          <div class="card-meta">
            <span v-if="c.dataEmissio"><v-icon size="12">mdi-calendar</v-icon> {{ c.dataEmissio }}</span>
            <span v-if="c.horariEmissio"><v-icon size="12">mdi-clock-outline</v-icon> {{ c.horariEmissio }}</span>
            <span v-if="c.plataforma"><v-icon size="12">mdi-television</v-icon> {{ c.plataforma }}</span>
          </div>
          <div v-if="c.origenSenyal" class="card-origen">
            <v-icon size="12">mdi-map-marker-outline</v-icon> {{ c.origenSenyal }}
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions" @click.stop>
          <v-tooltip text="Duplicar">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="text" @click="duplicar(c.id)">
                <v-icon size="16">mdi-content-copy</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Eliminar">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon size="small" variant="text" color="error" @click="confirmarEliminar(c)">
                <v-icon size="16">mdi-delete-outline</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </div>

        <!-- Data actualització -->
        <div class="card-updated">
          <v-icon size="11">mdi-clock-edit-outline</v-icon>
          {{ formatData(c.updatedAt) }}
        </div>
      </div>
    </div>

    <!-- Dialog confirmar eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-2">Eliminar contribució</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ aEliminar?.nomPrograma }}</strong>?
          Aquesta acció no es pot desfer.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">Cancel·lar</v-btn>
          <v-btn color="error" @click="fer_eliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useContribucionsStore } from '@/stores/contribucions'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const router = useRouter()
const store = useContribucionsStore()
const { llistaOrdenada } = storeToRefs(store)

const { duplicar, eliminar } = store

const cerca = ref('')
const dialogEliminar = ref(false)
const aEliminar = ref(null)

const llistaFiltrada = computed(() => {
  if (!cerca.value) return llistaOrdenada.value
  const q = cerca.value.toLowerCase()
  return llistaOrdenada.value.filter(c =>
    c.nomPrograma?.toLowerCase().includes(q) ||
    c.origenSenyal?.toLowerCase().includes(q) ||
    c.subtitol?.toLowerCase().includes(q)
  )
})

// logoId conté directament la URL de Cloudinary
function getImatge(id) {
  return id || null
}

onMounted(() => {
  if (store.llista.length === 0) store.carregarTotes()
})

function formatData(iso) {
  return dayjs(iso).format('DD/MM/YY HH:mm')
}

function confirmarEliminar(c) {
  aEliminar.value = c
  dialogEliminar.value = true
}

function fer_eliminar() {
  if (aEliminar.value) {
    eliminar(aEliminar.value.id)
    dialogEliminar.value = false
    aEliminar.value = null
  }
}
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 1200px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
}

.page-title {
  font-family: 'Space Mono', monospace;
  font-size: 26px;
  font-weight: 700;
  color: #1A1A2E;
  margin: 0;
}

.page-subtitle {
  font-size: 13px;
  color: #6B7280;
  margin: 4px 0 0;
}

.filter-bar {
  margin-bottom: 24px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  text-align: center;
}

.empty-title {
  font-family: 'Space Mono', monospace;
  font-size: 16px;
  font-weight: 700;
  color: #9CA3AF;
  margin: 0;
}

.empty-sub {
  font-size: 13px;
  color: #D1D5DB;
  margin: 0;
}

.contribucions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.contribucio-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 0;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.contribucio-card:hover {
  border-color: #E8001C;
  box-shadow: 0 4px 20px rgba(232,0,28,0.08);
  transform: translateY(-1px);
}

.card-logo-area {
  height: 80px;
  background: #F4F2EE;
  border-bottom: 1px solid #F0F0F0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-logo {
  max-height: 70px;
  max-width: 100%;
  object-fit: contain;
}

.card-logo-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.card-body {
  padding: 16px 16px 8px;
  flex: 1;
}

.card-header-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.card-title {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
  line-height: 1.3;
}

.card-subtitol {
  font-size: 12px;
  color: #6B7280;
  margin: 0 0 8px;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #6B7280;
  margin-bottom: 4px;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.card-origen {
  font-size: 11px;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-top: 2px;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  padding: 4px 8px;
  gap: 4px;
}

.card-updated {
  font-size: 10px;
  color: #D1D5DB;
  font-family: 'DM Mono', monospace;
  padding: 6px 16px;
  border-top: 1px solid #F9FAFB;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>
