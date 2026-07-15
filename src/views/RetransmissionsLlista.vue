<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Retransmissions</h1>
        <p class="page-subtitle">{{ llistaFiltrada.length }} retransmission{{ llistaFiltrada.length !== 1 ? 's' : '' }}</p>
      </div>
      <v-btn v-if="authStore.potEscriureTot" color="primary" prepend-icon="mdi-plus" size="small" @click="$router.push('/retransmissions/nova')">
        Nova retransmissió
      </v-btn>
    </div>

    <!-- Filtres -->
    <div class="filter-bar">
      <v-text-field
        v-model="cerca"
        prepend-inner-icon="mdi-magnify"
        placeholder="Cercar per nom o programa..."
        hide-details
        density="compact"
        bg-color="white"
        class="filter-search"
      />
      <v-select
        v-model="filtreEstat"
        :items="[{ value: null, title: 'Tots els estats' }, ...ESTATS.map(e => ({ value: e.value, title: e.label }))]"
        hide-details
        density="compact"
        bg-color="white"
        class="filter-estat"
      />
      <v-select
        v-model="filtrePeriode"
        :items="periodes"
        item-title="label"
        item-value="value"
        hide-details
        density="compact"
        bg-color="white"
        class="filter-periode"
      />
    </div>

    <!-- Empty state -->
    <div v-if="llistaFiltrada.length === 0" class="empty-state">
      <v-icon size="56" color="grey-lighten-2">mdi-broadcast</v-icon>
      <p class="empty-title">Cap retransmissió</p>
      <p class="empty-sub">Crea la primera retransmissió per començar</p>
      <v-btn v-if="authStore.potEscriureTot" color="primary" prepend-icon="mdi-plus" @click="$router.push('/retransmissions/nova')">
        Nova retransmissió
      </v-btn>
    </div>

    <!-- Llista -->
    <div v-else class="retransmissions-llista">
      <!-- Separador "Pròximes" -->
      <div v-if="properes.length && !filtraPassades" class="llista-seccio-label">
        <v-icon size="14">mdi-clock-fast</v-icon> Pròximes
      </div>

      <div
        v-for="r in llistaFiltrada"
        :key="r.id"
        class="r-card"
        @click="$router.push('/retransmissions/' + r.id)"
      >
        <!-- Columna data -->
        <div class="r-card-data">
          <span class="r-dia">{{ formatDia(r.data) }}</span>
          <span class="r-mes">{{ formatMes(r.data) }}</span>
          <span class="r-hora">{{ r.hora || '—' }}</span>
        </div>

        <!-- Columna principal -->
        <div class="r-card-cos">
          <div class="r-card-top">
            <span class="r-nom">{{ r.nom || 'Sense nom' }}</span>
            <v-chip
              :color="getEstatColor(r.estat)"
              size="x-small"
              class="r-estat-chip"
            >
              {{ getEstatLabel(r.estat) }}
            </v-chip>
          </div>
          <p v-if="r.programa" class="r-programa">{{ r.programa }}</p>
          <!-- Vincles -->
          <div class="r-vincles">
            <span v-if="r.contribucioId" class="r-vincle">
              <v-icon size="11">mdi-cable-data</v-icon>
              {{ getNomContribucio(r.contribucioId) }}
            </span>
            <span v-if="r.localitzacioId" class="r-vincle">
              <v-icon size="11">mdi-map-marker-outline</v-icon>
              {{ getNomLocalitzacio(r.localitzacioId) }}
            </span>
            <span v-if="r.ftthIds?.length" class="r-vincle">
              <v-icon size="11">mdi-fiber-optical</v-icon>
              {{ r.ftthIds.length }} FTTH{{ r.ftthIds.length !== 1 ? 's' : '' }}
            </span>
          </div>
        </div>

        <!-- Accions -->
        <div class="r-card-accions">
          <v-btn v-if="authStore.potEscriureTot" icon size="x-small" variant="text" color="error" @click.stop="confirmarEliminar(r)">
            <v-icon size="14">mdi-delete-outline</v-icon>
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Dialog eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-2">Eliminar retransmissió</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ aEliminar?.nom || 'aquesta retransmissió' }}</strong>?
          Aquesta acció no es pot desfer.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogEliminar = false">Cancel·lar</v-btn>
          <v-btn color="error" @click="ferEliminar">Eliminar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRetransmissionsStore, ESTATS } from '@/stores/retransmissions'
import { useContribucionsStore } from '@/stores/contribucions'
import { useFtthStore } from '@/stores/ftth'
import { useLocalitzacioStore } from '@/stores/localitzacio'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const store      = useRetransmissionsStore()
const storeContr = useContribucionsStore()
const storeFtth  = useFtthStore()
const storeLoc   = useLocalitzacioStore()
const authStore  = useAuthStore()

const { llistaOrdenada, properes } = storeToRefs(store)

onMounted(async () => {
  if (store.llista.length === 0) await store.carregarTotes()
  if (storeContr.llista.length === 0) await storeContr.carregarTotes()
  if (storeFtth.localitzacions.length === 0) await storeFtth.carregarTot()
  if (storeLoc.localitzacions.length === 0) await storeLoc.carregarTotes()
})

const cerca        = ref('')
const filtreEstat  = ref(null)
const filtrePeriode = ref('tot')

const periodes = [
  { value: 'tot',       label: 'Totes les dates' },
  { value: 'properes',  label: 'Pròximes' },
  { value: 'mes',       label: 'Aquest mes' },
  { value: 'any',       label: 'Aquest any' },
  { value: 'passades',  label: 'Passades' },
]

const filtraPassades = computed(() => filtrePeriode.value === 'passades')

const llistaFiltrada = computed(() => {
  const ara = new Date()
  const iniciMes = new Date(ara.getFullYear(), ara.getMonth(), 1)
  const iniciAny = new Date(ara.getFullYear(), 0, 1)

  return llistaOrdenada.value.filter(r => {
    // Filtre text
    if (cerca.value) {
      const q = cerca.value.toLowerCase()
      if (!r.nom?.toLowerCase().includes(q) && !r.programa?.toLowerCase().includes(q)) return false
    }
    // Filtre estat
    if (filtreEstat.value && r.estat !== filtreEstat.value) return false
    // Filtre període
    if (filtrePeriode.value !== 'tot') {
      const d = r.data ? new Date(r.data + 'T00:00') : null
      if (!d) return filtrePeriode.value === 'tot'
      if (filtrePeriode.value === 'properes' && d < ara) return false
      if (filtrePeriode.value === 'mes' && (d < iniciMes || d > new Date(ara.getFullYear(), ara.getMonth() + 1, 0))) return false
      if (filtrePeriode.value === 'any' && (d < iniciAny || d.getFullYear() !== ara.getFullYear())) return false
      if (filtrePeriode.value === 'passades' && d >= ara) return false
    }
    return true
  })
})

function getEstatLabel(estat) {
  return ESTATS.find(e => e.value === estat)?.label || estat
}
function getEstatColor(estat) {
  return ESTATS.find(e => e.value === estat)?.color || 'grey'
}
function getNomContribucio(id) {
  return storeContr.llista.find(c => c.id === id)?.nomPrograma || id?.slice(0, 8)
}
function getNomLocalitzacio(id) {
  return storeLoc.localitzacions.find(l => l.id === id)?.nom || id?.slice(0, 8)
}
function formatDia(data) {
  return data ? dayjs(data).format('DD') : '—'
}
function formatMes(data) {
  return data ? dayjs(data).format('MMM').toUpperCase() : ''
}

const dialogEliminar = ref(false)
const aEliminar = ref(null)

function confirmarEliminar(r) {
  aEliminar.value = r
  dialogEliminar.value = true
}
async function ferEliminar() {
  if (aEliminar.value) {
    await store.eliminar(aEliminar.value.id)
    dialogEliminar.value = false
    aEliminar.value = null
  }
}
</script>

<style scoped>
.page-wrapper {
  padding: 32px 40px;
  max-width: 1700px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  gap: 12px;
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
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.filter-search { flex: 2; min-width: 180px; }
.filter-estat  { flex: 1; min-width: 140px; }
.filter-periode { flex: 1; min-width: 140px; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 80px 0;
  text-align: center;
}
.empty-title { font-family: 'Space Mono', monospace; font-size: 16px; font-weight: 700; color: #9CA3AF; margin: 0; }
.empty-sub   { font-size: 13px; color: #D1D5DB; margin: 0; }

.llista-seccio-label {
  font-family: 'Space Mono', monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9CA3AF;
  padding: 4px 0 8px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.retransmissions-llista {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.r-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.15s;
}

.r-card:hover {
  border-color: #E8001C;
  box-shadow: 0 2px 12px rgba(232,0,28,0.07);
}

.r-card-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 44px;
  flex-shrink: 0;
}

.r-dia  { font-family: 'Space Mono', monospace; font-size: 22px; font-weight: 700; color: #1A1A2E; line-height: 1; }
.r-mes  { font-size: 9px; font-weight: 700; letter-spacing: 0.08em; color: #E8001C; text-transform: uppercase; }
.r-hora { font-size: 10px; color: #9CA3AF; font-family: 'DM Mono', monospace; margin-top: 2px; }

.r-card-cos {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.r-card-top {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.r-nom { font-family: 'Space Mono', monospace; font-size: 14px; font-weight: 700; color: #1A1A2E; }
.r-estat-chip { flex-shrink: 0; }
.r-programa { font-size: 12px; color: #6B7280; margin: 0; }

.r-vincles {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.r-vincle {
  font-size: 11px;
  color: #9CA3AF;
  display: flex;
  align-items: center;
  gap: 3px;
}

.r-card-accions {
  flex-shrink: 0;
}

@media (max-width: 767px) {
  .page-wrapper { padding: 20px 16px; }
  .page-title   { font-size: 20px; }
  .filter-bar   { flex-direction: column; gap: 8px; }
  .filter-search, .filter-estat, .filter-periode { flex: none; width: 100%; }
  .r-card-data  { display: none; }
}
</style>
