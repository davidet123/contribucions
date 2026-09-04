<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Localitzacions FTTH</h1>
        <p class="page-subtitle">{{ localitzacionsOrdenades.length }} localitzac{{ localitzacionsOrdenades.length !== 1 ? 'ions' : 'ió' }}</p>
      </div>
      <v-btn v-if="authStore.potEscriureFtth" color="primary" prepend-icon="mdi-plus" @click="$router.push('/ftth/nova')" size="small">
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
        class="filter-search"
        bg-color="white"
      />
      <v-chip-group v-model="filtreTipus" mandatory class="filter-chips">
        <v-chip :value="null" filter>Tot</v-chip>
        <v-chip value="permanent" filter>Permanent</v-chip>
        <v-chip value="ocasional" filter>Ocasional</v-chip>
      </v-chip-group>
      <v-select
        v-model="mesSeleccionat"
        :items="[{ value: null, title: 'Tots els mesos' }, ...mesos.map(m => ({ value: m.value, title: m.label }))]"
        hide-details
        density="compact"
        bg-color="white"
        class="filter-mes"
      />
      <v-select
        v-model="anySeleccionat"
        :items="[{ value: null, title: 'Tots els anys' }, ...anysDisponibles.map(a => ({ value: a, title: String(a) }))]"
        hide-details
        density="compact"
        bg-color="white"
        class="filter-any"
      />
    </div>

    <!-- Empty state -->
    <div v-if="llistaFiltrada.length === 0" class="empty-state">
      <v-icon size="56" color="grey-lighten-2">mdi-fiber-optical</v-icon>
      <p class="empty-title">Cap localització FTTH</p>
      <p class="empty-sub">Crea la primera localització per començar</p>
      <v-btn v-if="authStore.potEscriureFtth" color="primary" prepend-icon="mdi-plus" @click="$router.push('/ftth/nova')">
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
          <div class="card-header-right">
            <v-chip :color="loc.tipus === 'permanent' ? 'success' : 'warning'" size="x-small">
              {{ loc.tipus === 'permanent' ? 'Permanent' : 'Ocasional' }}
            </v-chip>
            <v-btn
              v-if="authStore.potEscriureFtth"
              icon
              size="x-small"
              variant="text"
              color="error"
              @click.stop="confirmarEliminar(loc)"
            >
              <v-icon size="14">mdi-delete-outline</v-icon>
            </v-btn>
          </div>
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

    <!-- Dialog confirmar eliminar -->
    <v-dialog v-model="dialogEliminar" max-width="400">
      <v-card>
        <v-card-title class="text-h6 pa-6 pb-2">Eliminar localització FTTH</v-card-title>
        <v-card-text>
          Estàs segur que vols eliminar <strong>{{ aEliminar?.nom || 'aquesta localització' }}</strong>?
          S'eliminaran també totes les fotos associades. Aquesta acció no es pot desfer.
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFtthStore } from '@/stores/ftth'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { useFiltreMesAny } from '@/composables/useFiltreMesAny'

const router = useRouter()
const store = useFtthStore()
const authStore = useAuthStore()
onMounted(() => store.carregarTot())
const { localitzacionsOrdenades, instaladors } = storeToRefs(store)

const cerca = ref('')
const filtreTipus = ref(null)

const { mesSeleccionat, anySeleccionat, mesos, anysDisponibles, coincideix } =
  useFiltreMesAny(localitzacionsOrdenades, (loc) => loc.dataAlta || loc.createdAt)

const llistaFiltrada = computed(() => {
  let llista = localitzacionsOrdenades.value
  if (filtreTipus.value) {
    llista = llista.filter(l => l.tipus === filtreTipus.value)
  }
  llista = llista.filter(l => coincideix(l))
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

const dialogEliminar = ref(false)
const aEliminar = ref(null)

function confirmarEliminar(loc) {
  aEliminar.value = loc
  dialogEliminar.value = true
}

async function ferEliminar() {
  if (aEliminar.value) {
    await store.eliminarLocalitzacio(aEliminar.value.id)
    dialogEliminar.value = false
    aEliminar.value = null
  }
}

function formatData(iso) {
  return dayjs(iso).format('DD/MM/YY HH:mm')
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
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-search {
  max-width: 360px;
  flex: 1;
  min-width: 160px;
}

.filter-chips {
  flex-shrink: 0;
}

.filter-mes,
.filter-any {
  max-width: 160px;
  flex-shrink: 0;
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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
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

.card-header-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
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

/* Responsive mòbil */
@media (max-width: 767px) {
  .page-wrapper {
    padding: 20px 16px;
  }

  .page-title {
    font-size: 20px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .filter-search,
  .filter-mes,
  .filter-any {
    max-width: 100%;
  }

  .ftth-grid {
    grid-template-columns: 1fr;
  }
}
</style>