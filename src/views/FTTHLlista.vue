<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Localitzacions FTTH</h1>
        <p class="page-subtitle">{{ localitzacionsOrdenades.length }} localitzac{{ localitzacionsOrdenades.length !== 1 ? 'ions' : 'ió' }}</p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/ftth/nova')">
        Nova localització
      </v-btn>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <v-text-field
        v-model="cerca"
        prepend-inner-icon="mdi-magnify"
        placeholder="Cercar per nom, adreça..."
        hide-details
        density="compact"
        style="max-width: 360px"
        bg-color="white"
      />
      <v-chip-group v-model="filtreTipus" mandatory class="ml-auto">
        <v-chip :value="null" filter>Tot</v-chip>
        <v-chip value="permanent" filter>Permanent</v-chip>
        <v-chip value="ocasional" filter>Ocasional</v-chip>
      </v-chip-group>
    </div>

    <!-- Empty state -->
    <div v-if="llistaFiltrada.length === 0" class="empty-state">
      <v-icon size="56" color="grey-lighten-2">mdi-fiber-optical</v-icon>
      <p class="empty-title">Cap localització FTTH</p>
      <p class="empty-sub">Crea la primera localització per començar</p>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/ftth/nova')">
        Nova localització
      </v-btn>
    </div>

    <!-- Grid -->
    <div v-else class="ftth-grid">
      <div
        v-for="loc in llistaFiltrada"
        :key="loc.id"
        class="ftth-card"
        @click="$router.push('/ftth/' + loc.id)"
      >
        <div class="card-header">
          <span class="card-title">{{ loc.nom || 'Sense nom' }}</span>
          <v-chip :color="loc.tipus === 'permanent' ? 'success' : 'warning'" size="x-small">
            {{ loc.tipus === 'permanent' ? 'Permanent' : 'Ocasional' }}
          </v-chip>
        </div>
        <p v-if="loc.adreca" class="card-adreca">
          <v-icon size="12">mdi-map-marker-outline</v-icon> {{ loc.adreca }}
        </p>
        <div class="card-meta">
          <span v-if="loc.ip"><v-icon size="12">mdi-network</v-icon> {{ loc.ip }}</span>
          <span v-if="loc.telefonFixe"><v-icon size="12">mdi-phone-outline</v-icon> {{ loc.telefonFixe }}</span>
          <span v-if="getInstaladorNom(loc.instaladorId)"><v-icon size="12">mdi-account-hard-hat</v-icon> {{ getInstaladorNom(loc.instaladorId) }}</span>
        </div>
        <div class="card-stats">
          <span><v-icon size="10">mdi-speedometer</v-icon> {{ loc.speedResults?.length || 0 }} tests</span>
          <span><v-icon size="10">mdi-camera</v-icon> {{ loc.fotos?.length || 0 }} fotos</span>
        </div>
        <div class="card-updated">
          <v-icon size="11">mdi-clock-edit-outline</v-icon>
          {{ formatData(loc.updatedAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFtthStore } from '@/stores/ftth'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const router = useRouter()
const store = useFtthStore()
const { localitzacionsOrdenades, instaladors } = storeToRefs(store)

const cerca = ref('')
const filtreTipus = ref(null)

const llistaFiltrada = computed(() => {
  let llista = localitzacionsOrdenades.value
  if (filtreTipus.value) {
    llista = llista.filter(l => l.tipus === filtreTipus.value)
  }
  if (cerca.value) {
    const q = cerca.value.toLowerCase()
    llista = llista.filter(l =>
      l.nom?.toLowerCase().includes(q) ||
      l.adreca?.toLowerCase().includes(q)
    )
  }
  return llista
})

function getInstaladorNom(id) {
  if (!id) return null
  const inst = instaladors.value.find(i => i.id === id)
  return inst?.nom || null
}

function formatData(iso) {
  return dayjs(iso).format('DD/MM/YY HH:mm')
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
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

.ftth-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 16px;
}

.ftth-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ftth-card:hover {
  border-color: #E8001C;
  box-shadow: 0 4px 20px rgba(232,0,28,0.08);
  transform: translateY(-1px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A2E;
}

.card-adreca {
  font-size: 12px;
  color: #6B7280;
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0;
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: #6B7280;
}

.card-meta span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.card-stats {
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #9CA3AF;
}

.card-stats span {
  display: flex;
  align-items: center;
  gap: 3px;
}

.card-updated {
  font-size: 10px;
  color: #D1D5DB;
  font-family: 'DM Mono', monospace;
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}
</style>