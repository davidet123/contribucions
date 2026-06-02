<template>
  <div class="editor-wrapper">
    <!-- Top bar -->
    <div class="editor-topbar">
      <div class="topbar-left">
        <v-btn icon variant="text" size="small" @click="$router.push('/contribucions')">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <div class="topbar-title">{{ contribucio?.nomPrograma || 'Nova contribució' }}</div>
          <div class="topbar-meta" v-if="contribucio">
            <span class="versio-badge">v{{ contribucio.versio }}</span>
            <span>{{ contribucio.dataVersio }}</span>
            <span v-if="saved" class="saved-indicator"><v-icon size="12" color="success">mdi-check-circle</v-icon> Desat</span>
          </div>
        </div>
      </div>
      <div class="topbar-right">
        <v-btn variant="outlined" prepend-icon="mdi-eye-outline" size="small" @click="mostrarPreview = true">
          Previsualitzar
        </v-btn>
        <v-btn color="primary" prepend-icon="mdi-file-pdf-box" size="small" @click="exportarPDF">
          Exportar PDF
        </v-btn>
        <v-btn color="secondary" prepend-icon="mdi-content-save-outline" size="small" @click="guardar">
          Guardar
        </v-btn>
      </div>
    </div>

    <div class="editor-body" v-if="contribucio">
      <!-- Left: form sections -->
      <div class="editor-form">

        <!-- CAPÇALERA -->
        <SeccioCapcalera :contribucio="contribucio" @update="handleUpdate" />

        <!-- EQUIPS DE CAMP -->
        <SeccioEquips :contribucio="contribucio" @update="handleUpdate" />

        <!-- SENYALS -->
        <SeccioSenyals :contribucio="contribucio" @update="handleUpdate" />

        <!-- ROUTING CCT -->
        <SeccioRoutingCCT :contribucio="contribucio" @update="handleUpdate" />

        <!-- COMUNICACIONS -->
        <SeccioComunicacions :contribucio="contribucio" @update="handleUpdate" />

        <!-- CONTACTES I NOTES -->
        <SeccioContactes :contribucio="contribucio" @update="handleUpdate" />

      </div>

      <!-- Right: live preview mini -->
      <div class="editor-preview-panel">
        <div class="preview-label">Previsualització</div>
        <DiagramaContribucio :contribucio="contribucio" mode="preview" />
      </div>
    </div>

    <!-- Version warning dialog -->
    <v-dialog v-model="dialogVersio" max-width="460">
      <v-card>
        <v-card-title class="pa-6 pb-2">
          <v-icon color="warning" class="mr-2">mdi-alert-outline</v-icon>
          Versió ja existent
        </v-card-title>
        <v-card-text>
          La versió <strong>v{{ contribucio?.versio }}</strong> ja ha sigut guardada anteriorment.
          Vols sobreescriure-la o incrementar el número de versió?
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" @click="dialogVersio = false">Cancel·lar</v-btn>
          <v-btn variant="outlined" @click="incrementarVersio">Incrementar versió</v-btn>
          <v-btn color="warning" @click="sobreescriure">Sobreescriure</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Full preview dialog -->
    <v-dialog v-model="mostrarPreview" fullscreen>
      <v-card>
        <v-toolbar color="secondary" density="compact">
          <v-btn icon @click="mostrarPreview = false"><v-icon>mdi-close</v-icon></v-btn>
          <v-toolbar-title class="text-white">Previsualització PDF</v-toolbar-title>
          <v-spacer />
          <v-btn color="primary" prepend-icon="mdi-file-pdf-box" @click="exportarPDF">Exportar PDF</v-btn>
        </v-toolbar>
        <v-card-text class="pa-8" style="background: #999;">
          <div class="pdf-preview-wrapper">
            <PaginaPDF :contribucio="contribucio" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useContribucionsStore } from '@/stores/contribucions'
import SeccioCapcalera from '@/components/contribucio/SeccioCapcalera.vue'
import SeccioEquips from '@/components/contribucio/SeccioEquips.vue'
import SeccioSenyals from '@/components/contribucio/SeccioSenyals.vue'
import SeccioRoutingCCT from '@/components/contribucio/SeccioRoutingCCT.vue'
import SeccioComunicacions from '@/components/contribucio/SeccioComunicacions.vue'
import SeccioContactes from '@/components/contribucio/SeccioContactes.vue'
import DiagramaContribucio from '@/components/contribucio/DiagramaContribucio.vue'
import PaginaPDF from '@/components/contribucio/PaginaPDF.vue'

const route = useRoute()
const router = useRouter()
const store = useContribucionsStore()

const contribucio = ref(null)
const saved = ref(false)
const dialogVersio = ref(false)
const mostrarPreview = ref(false)
const versioOriginal = ref(null)

onMounted(() => {
  if (route.params.id) {
    const c = store.getById(route.params.id)
    if (c) {
      contribucio.value = JSON.parse(JSON.stringify(c))
      versioOriginal.value = c.versio
    } else {
      router.push('/contribucions')
    }
  } else {
    // Nova
    const nova = store.crear()
    contribucio.value = JSON.parse(JSON.stringify(nova))
    versioOriginal.value = nova.versio
    router.replace('/contribucions/' + nova.id)
  }
})

function handleUpdate(patch) {
  if (!contribucio.value) return
  Object.assign(contribucio.value, patch)
  saved.value = false
}

function guardar() {
  if (!contribucio.value) return
  const existent = store.getById(contribucio.value.id)
  // Check si la versió ja existia i ha canviat contingut
  if (existent && existent.versio === contribucio.value.versio && !saved.value) {
    dialogVersio.value = true
    return
  }
  fer_guardar()
}

function fer_guardar() {
  store.actualitzar(contribucio.value.id, contribucio.value)
  versioOriginal.value = contribucio.value.versio
  saved.value = true
  dialogVersio.value = false
}

function incrementarVersio() {
  contribucio.value.versio = (parseInt(contribucio.value.versio) || 1) + 1
  fer_guardar()
}

function sobreescriure() {
  fer_guardar()
}

async function exportarPDF() {
  // Import dinàmic per no alentir la càrrega inicial
  const { generarPDF } = await import('@/utils/pdfExport.js')
  await generarPDF(contribucio.value)
}
</script>

<style scoped>
.editor-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.editor-topbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: white;
  border-bottom: 1px solid #E5E7EB;
  padding: 12px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-title {
  font-family: 'Space Mono', monospace;
  font-size: 14px;
  font-weight: 700;
  color: #1A1A2E;
}

.topbar-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #9CA3AF;
  margin-top: 2px;
  font-family: 'DM Mono', monospace;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.saved-indicator {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #2E7D32;
}

.editor-body {
  display: grid;
  grid-template-columns: 1fr 640px;
  gap: 0;
  flex: 1;
  align-items: start;
}

.editor-form {
  padding: 32px 32px 80px;
  max-width: 860px;
}

.editor-preview-panel {
  position: sticky;
  top: 65px;
  padding: 24px 24px 24px 0;
  max-height: calc(100vh - 65px);
  overflow-y: auto;
}

.preview-label {
  font-family: 'Space Mono', monospace;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #9CA3AF;
  margin-bottom: 12px;
}

.pdf-preview-wrapper {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 8px 40px rgba(0,0,0,0.3);
}
</style>
