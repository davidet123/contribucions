<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Localitzacions</h1>
        <p class="page-subtitle">
          {{ localitzacionsOrdenades.length }}
          {{ localitzacionsOrdenades.length !== 1 ? 'localitzacions' : 'localització' }}
        </p>
      </div>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/localitzacio/nova')" size="small">
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
    </div>

    <!-- Empty state -->
    <div v-if="llistaFiltrada.length === 0" class="empty-state">
      <v-icon size="56" color="grey-lighten-2">mdi-map-marker-multiple-outline</v-icon>
      <p class="empty-title">Cap localització</p>
      <p class="empty-sub">Crea la primera localització per començar</p>
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/localitzacio/nova')">
        Nova localització
      </v-btn>
    </div>

    <!-- Grid -->
    <div v-else class="ftth-grid">
      <div
        v-for="loc in llistaFiltrada"
        :key="loc.id"
        class="ftth-card"
        @click="$router.push('/localitzacio/' + loc.id)"
      >
        <div class="card-header">
          <span class="card-title">{{ loc.nom || 'Sense nom' }}</span>
          <div class="card-header-right">
            <v-chip
              v-if="loc.transportSenyal?.length"
              size="x-small"
              color="info"
              variant="tonal"
            >
              {{ loc.transportSenyal.length }} transport{{ loc.transportSenyal.length !== 1 ? 's' : '' }}
            </v-chip>
            <v-btn
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
          <span v-if="loc.contactes?.length">
            <v-icon size="12">mdi-account-multiple-outline</v-icon>
            {{ loc.contactes.length }} contacte{{ loc.contactes.length !== 1 ? 's' : '' }}
          </span>
          <span v-if="loc.material?.length">
            <v-icon size="12">mdi-package-variant-closed</v-icon>
            {{ loc.material.length }} element{{ loc.material.length !== 1 ? 's' : '' }}
          </span>
          <span v-if="loc.produccio">
            <v-icon size="12">mdi-video-outline</v-icon>
            {{ loc.produccio }}
          </span>
        </div>
        <div class="card-stats">
          <span><v-icon size="10">mdi-camera</v-icon> {{ loc.fotos?.length || 0 }} fotos</span>
          <span v-if="loc.senyalsPrevistes">
            <v-icon size="10">mdi-signal</v-icon> Senyals definides
          </span>
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
        <v-card-title class="text-h6 pa-6 pb-2">Eliminar localització</v-card-title>
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
import { useLocalitzacioStore } from '@/stores/localitzacio'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'

const store = useLocalitzacioStore()
onMounted(() => store.carregarTotes())
const { localitzacionsOrdenades } = storeToRefs(store)

const cerca = ref('')

const llistaFiltrada = computed(() => {
  let llista = localitzacionsOrdenades.value
  if (cerca.value) {
    const q = cerca.value.toLowerCase()
    llista = llista.filter(l =>
      l.nom?.toLowerCase().includes(q) ||
      l.adreca?.toLowerCase().includes(q)
    )
  }
  return llista
})

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
  max-width: 1200px;
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
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.filter-search {
  max-width: 360px;
  flex: 1;
  min-width: 160px;
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

.card-chips {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
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

  .filter-search {
    max-width: 100%;
  }

  .ftth-grid {
    grid-template-columns: 1fr;
  }
}
</style>
