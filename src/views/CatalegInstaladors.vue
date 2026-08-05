<template>
  <div class="page-wrapper">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Instal·ladors</h1>
        <p class="page-subtitle">{{ instaladors.length }} instal·lador{{ instaladors.length !== 1 ? 's' : '' }}</p>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-file-pdf-box"
          :loading="exportantPdf"
          :disabled="instaladors.length === 0"
          @click="exportarPdf"
        >
          Exportar PDF
        </v-btn>
        <v-btn v-if="authStore.potEscriureFtth" color="primary" prepend-icon="mdi-plus" size="small" @click="obrirNou">
          Nou instal·lador
        </v-btn>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="filter-bar">
      <v-text-field
        v-model="cerca"
        prepend-inner-icon="mdi-magnify"
        placeholder="Cercar per nom o telèfon..."
        hide-details
        density="compact"
        class="filter-search"
        bg-color="white"
      />
    </div>

    <!-- Empty state -->
    <div v-if="llistaFiltrada.length === 0" class="empty-state">
      <v-icon size="56" color="grey-lighten-2">mdi-account-hard-hat-outline</v-icon>
      <p class="empty-title">Cap instal·lador</p>
      <p class="empty-sub">{{ cerca ? 'Cap resultat per a la cerca' : "Encara no hi ha instal·ladors donats d'alta" }}</p>
    </div>

    <!-- Grid -->
    <div v-else class="instaladors-grid">
      <div
        v-for="inst in llistaFiltrada"
        :key="inst.id"
        class="instalador-card"
        @click="obrirEditar(inst)"
      >
        <div class="card-avatar">{{ inicials(inst.nom) }}</div>
        <div class="card-info">
          <span class="card-nom">{{ inst.nom || 'Sense nom' }}</span>
          <span class="card-meta">
            <span v-if="inst.empresa">{{ inst.empresa }}</span>
            <span v-if="inst.empresa && inst.localitat"> · </span>
            <span v-if="inst.localitat">{{ inst.localitat }}</span>
          </span>
        </div>
        <div class="card-telefon">
          <v-icon size="12">mdi-phone-outline</v-icon> {{ inst.telefon || '—' }}
        </div>
      </div>
    </div>

    <!-- Dialog de detall (nou / editar) -->
    <DialogInstaladorDetall
      v-model="dialogDetall"
      :instalador="instaladorSeleccionat"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFtthStore } from '@/stores/ftth'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import DialogInstaladorDetall from '@/components/cataleg/DialogInstaladorDetall.vue'

const store = useFtthStore()
const authStore = useAuthStore()
const { instaladors } = storeToRefs(store)

onMounted(() => {
  if (store.instaladors.length === 0 || store.localitzacions.length === 0) {
    store.carregarTot()
  }
})

const cerca = ref('')
const dialogDetall = ref(false)
const instaladorSeleccionat = ref(null)
const exportantPdf = ref(false)

const llistaFiltrada = computed(() => {
  if (!cerca.value) return instaladors.value
  const q = cerca.value.toLowerCase()
  return instaladors.value.filter(i =>
    i.nom?.toLowerCase().includes(q) ||
    i.telefon?.toLowerCase().includes(q)
  )
})

function inicials(nom = '') {
  return nom.split(' ').slice(0, 2).map(p => p[0]?.toUpperCase() || '').join('')
}

function obrirNou() {
  instaladorSeleccionat.value = null
  dialogDetall.value = true
}

function obrirEditar(inst) {
  instaladorSeleccionat.value = inst
  dialogDetall.value = true
}

async function exportarPdf() {
  exportantPdf.value = true
  try {
    const { generarPDFInstaladors } = await import('@/utils/pdfExportInstaladors.js')
    await generarPDFInstaladors(instaladors.value)
  } finally {
    exportantPdf.value = false
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
  flex-wrap: wrap;
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

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
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

.instaladors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.instalador-card {
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  gap: 12px;
}

.instalador-card:hover {
  border-color: #E8001C;
  box-shadow: 0 4px 20px rgba(232,0,28,0.08);
  transform: translateY(-1px);
}

.card-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #1A1A2E;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-nom {
  font-family: 'Space Mono', monospace;
  font-size: 13px;
  font-weight: 700;
  color: #1A1A2E;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 11px;
  color: #9CA3AF;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-telefon {
  font-size: 11px;
  color: #6B7280;
  font-family: 'DM Mono', monospace;
  display: flex;
  align-items: center;
  gap: 3px;
  flex-shrink: 0;
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

  .instaladors-grid {
    grid-template-columns: 1fr;
  }
}
</style>